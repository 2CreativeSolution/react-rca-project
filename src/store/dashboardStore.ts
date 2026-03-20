import { create } from "zustand";
import {
  getDashboardData,
  type DashboardAsset,
  type DashboardInsight,
  type DashboardOrder,
  type DashboardOrderFulfillmentStep,
  type DashboardQuote,
  type DashboardSnapshot,
  type DashboardSummary,
} from "../services/salesforceApi";

type DashboardStatus = "idle" | "loading" | "success" | "error";

type EnsureLoadedOptions = {
  force?: boolean;
};

export type OrderBucket = "inProgress" | "active" | "past";

export type BucketedDashboardOrder = DashboardOrder & {
  bucket: OrderBucket;
};

type DashboardStoreState = {
  snapshot: DashboardSnapshot | null;
  status: DashboardStatus;
  errorMessage: string | null;
  fetchedAt: string | null;
  isRefreshing: boolean;
  lastAccountId: string | null;
  inFlightPromise: Promise<void> | null;
  ensureLoaded: (accountId: string, options?: EnsureLoadedOptions) => Promise<void>;
  refresh: (accountId: string) => Promise<void>;
  clear: () => void;
};

const DATA_TTL_MS = 60_000;
const EMPTY_ORDERS: DashboardOrder[] = [];
const EMPTY_QUOTES: DashboardQuote[] = [];
const EMPTY_ASSETS: DashboardAsset[] = [];
const EMPTY_INSIGHTS: DashboardInsight[] = [];
const EMPTY_BUCKETED_ORDERS: BucketedDashboardOrder[] = [];
const EMPTY_SNAPSHOT: DashboardSnapshot | null = null;

function asTimestamp(value: string | null): number {
  if (!value) {
    return 0;
  }

  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function normalizeText(value: string | null | undefined): string {
  return value?.trim().toLowerCase() ?? "";
}

function isDelayedState(order: DashboardOrder): boolean {
  const state = normalizeText(order.fulfillment?.state ?? order.status);
  return state.includes("delay");
}

function isOverdueStep(step: DashboardOrderFulfillmentStep): boolean {
  return normalizeText(step.jeopardyStatus).includes("overdue");
}

function isInProgressStep(step: DashboardOrderFulfillmentStep): boolean {
  // Salesforce state labels can be "In Progress"/"IN_PROGRESS"; normalize checks to avoid deprioritizing active steps.
  return normalizeText(step.state).includes("inprogress");
}

function isPendingStep(step: DashboardOrderFulfillmentStep): boolean {
  return normalizeText(step.state).includes("pending");
}

function getStepUrgencyScore(step: DashboardOrderFulfillmentStep): number {
  if (isOverdueStep(step)) {
    return 0;
  }
  if (isInProgressStep(step)) {
    return 1;
  }
  if (isPendingStep(step)) {
    return 2;
  }
  return 3;
}

function getOverdueStepCount(order: DashboardOrder): number {
  return order.fulfillment?.steps.filter((step) => isOverdueStep(step)).length ?? 0;
}

export function selectTopActionableFulfillmentSteps(
  order: DashboardOrder,
  limit = 3
): DashboardOrderFulfillmentStep[] {
  const steps = order.fulfillment?.steps ?? [];
  if (steps.length === 0 || limit <= 0) {
    return [];
  }

  return [...steps]
    .sort((a, b) => {
      const scoreDiff = getStepUrgencyScore(a) - getStepUrgencyScore(b);
      if (scoreDiff !== 0) {
        return scoreDiff;
      }

      return asTimestamp(a.plannedCompletionDate) - asTimestamp(b.plannedCompletionDate);
    })
    .slice(0, limit);
}

export function selectMilestoneProgressPercent(order: DashboardOrder): number | null {
  return order.fulfillment?.progressPercent ?? order.activationProgressPercent;
}

export function selectOrderAtRisk(order: DashboardOrder): boolean {
  return isDelayedState(order) || getOverdueStepCount(order) > 0;
}

function isFreshEnough(fetchedAt: string | null): boolean {
  const timestamp = asTimestamp(fetchedAt);
  if (!timestamp) {
    return false;
  }

  return Date.now() - timestamp < DATA_TTL_MS;
}

function normalizeErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message;
  }

  return "Unable to load dashboard data.";
}

export const useDashboardStore = create<DashboardStoreState>((set, get) => ({
  snapshot: null,
  status: "idle",
  errorMessage: null,
  fetchedAt: null,
  isRefreshing: false,
  lastAccountId: null,
  inFlightPromise: null,
  async ensureLoaded(accountId: string, options?: EnsureLoadedOptions): Promise<void> {
    const normalizedAccountId = accountId.trim();
    if (!normalizedAccountId) {
      set({
        snapshot: null,
        status: "error",
        errorMessage: "Account identifier is unavailable.",
        fetchedAt: null,
        isRefreshing: false,
        lastAccountId: null,
        inFlightPromise: null,
      });
      return;
    }

    const state = get();
    const shouldForce = options?.force === true;
    const isSameAccount = state.lastAccountId === normalizedAccountId;
    const hasUsableSnapshot = isSameAccount && Boolean(state.snapshot);

    if (!shouldForce && hasUsableSnapshot && isFreshEnough(state.fetchedAt)) {
      return;
    }

    // Current product assumption: one account per SPA session.
    // If account switching is introduced without a full reload, scope in-flight dedupe by accountId.
    if (state.inFlightPromise) {
      return state.inFlightPromise;
    }

    set((previous) => ({
      status: previous.snapshot ? previous.status : "loading",
      errorMessage: null,
      lastAccountId: normalizedAccountId,
    }));

    const inFlightPromise = (async () => {
      try {
        const snapshot = await getDashboardData({ accountId: normalizedAccountId });
        set({
          snapshot,
          status: "success",
          errorMessage: null,
          fetchedAt: new Date().toISOString(),
          isRefreshing: false,
          lastAccountId: normalizedAccountId,
        });
      } catch (error) {
        set((previous) => ({
          status: previous.snapshot ? "success" : "error",
          errorMessage: normalizeErrorMessage(error),
          isRefreshing: false,
        }));
      } finally {
        set({ inFlightPromise: null });
      }
    })();

    set({ inFlightPromise });
    return inFlightPromise;
  },
  async refresh(accountId: string): Promise<void> {
    const normalizedAccountId = accountId.trim();
    if (!normalizedAccountId) {
      set({ errorMessage: "Account identifier is unavailable." });
      return;
    }

    const state = get();
    if (state.inFlightPromise) {
      return state.inFlightPromise;
    }

    set({
      isRefreshing: true,
      errorMessage: null,
      lastAccountId: normalizedAccountId,
    });

    const inFlightPromise = (async () => {
      try {
        const snapshot = await getDashboardData({ accountId: normalizedAccountId });
        set({
          snapshot,
          status: "success",
          errorMessage: null,
          fetchedAt: new Date().toISOString(),
          isRefreshing: false,
          lastAccountId: normalizedAccountId,
        });
      } catch (error) {
        set((previous) => ({
          status: previous.snapshot ? "success" : "error",
          errorMessage: normalizeErrorMessage(error),
          isRefreshing: false,
        }));
      } finally {
        set({ inFlightPromise: null });
      }
    })();

    set({ inFlightPromise });
    return inFlightPromise;
  },
  clear(): void {
    set({
      snapshot: null,
      status: "idle",
      errorMessage: null,
      fetchedAt: null,
      isRefreshing: false,
      lastAccountId: null,
      inFlightPromise: null,
    });
  },
}));

export function selectSnapshot(state: DashboardStoreState): DashboardSnapshot | null {
  return state.snapshot ?? EMPTY_SNAPSHOT;
}

export function selectKpis(state: DashboardStoreState): DashboardSummary | null {
  return state.snapshot?.summary ?? null;
}

// Selectors must return stable references for unchanged state.
export function selectQuotes(state: DashboardStoreState): DashboardQuote[] {
  if (!state.snapshot) {
    return EMPTY_QUOTES;
  }

  return state.snapshot.quotes;
}

export function selectAssets(state: DashboardStoreState): DashboardAsset[] {
  if (!state.snapshot) {
    return EMPTY_ASSETS;
  }

  return state.snapshot.assets;
}

export function selectAiInsights(state: DashboardStoreState): DashboardInsight[] {
  return state.snapshot?.aiInsights ?? EMPTY_INSIGHTS;
}

export function selectOrdersByBucket(state: DashboardStoreState, bucket: OrderBucket): DashboardOrder[] {
  if (!state.snapshot) {
    return EMPTY_ORDERS;
  }

  if (bucket === "inProgress") {
    return state.snapshot.inProgressOrders;
  }

  if (bucket === "active") {
    return state.snapshot.activeOrders;
  }

  return state.snapshot.pastOrders;
}

export function selectBucketedOrders(state: DashboardStoreState): BucketedDashboardOrder[] {
  if (!state.snapshot) {
    return EMPTY_BUCKETED_ORDERS;
  }

  return [
    ...state.snapshot.inProgressOrders.map((order) => ({ ...order, bucket: "inProgress" as const })),
    ...state.snapshot.activeOrders.map((order) => ({ ...order, bucket: "active" as const })),
    ...state.snapshot.pastOrders.map((order) => ({ ...order, bucket: "past" as const })),
  ];
}

export function selectOrdersSortedByUrgency(orders: DashboardOrder[]): DashboardOrder[] {
  return [...orders].sort((a, b) => {
    const aMinutes = a.minutesRemaining ?? Number.POSITIVE_INFINITY;
    const bMinutes = b.minutesRemaining ?? Number.POSITIVE_INFINITY;
    if (aMinutes !== bMinutes) {
      return aMinutes - bMinutes;
    }

    const aDate = asTimestamp(a.effectiveDate);
    const bDate = asTimestamp(b.effectiveDate);
    return bDate - aDate;
  });
}

export function selectOrdersSortedForMilestones(orders: DashboardOrder[]): DashboardOrder[] {
  return [...orders].sort((a, b) => {
    const aDelayedRank = isDelayedState(a) ? 0 : 1;
    const bDelayedRank = isDelayedState(b) ? 0 : 1;
    if (aDelayedRank !== bDelayedRank) {
      return aDelayedRank - bDelayedRank;
    }

    const overdueDiff = getOverdueStepCount(b) - getOverdueStepCount(a);
    if (overdueDiff !== 0) {
      return overdueDiff;
    }

    const aMinutes = a.minutesRemaining ?? Number.POSITIVE_INFINITY;
    const bMinutes = b.minutesRemaining ?? Number.POSITIVE_INFINITY;
    if (aMinutes !== bMinutes) {
      return aMinutes - bMinutes;
    }

    const aProgress = selectMilestoneProgressPercent(a) ?? Number.POSITIVE_INFINITY;
    const bProgress = selectMilestoneProgressPercent(b) ?? Number.POSITIVE_INFINITY;
    if (aProgress !== bProgress) {
      return aProgress - bProgress;
    }

    return asTimestamp(b.effectiveDate) - asTimestamp(a.effectiveDate);
  });
}

export function selectOrdersSortedByEffectiveDateDesc(orders: DashboardOrder[]): DashboardOrder[] {
  return [...orders].sort((a, b) => asTimestamp(b.effectiveDate) - asTimestamp(a.effectiveDate));
}

export function selectOrdersFiltered(
  orders: DashboardOrder[],
  options: { query?: string; status?: string }
): DashboardOrder[] {
  const normalizedQuery = options.query?.trim().toLowerCase() ?? "";
  const normalizedStatus = options.status?.trim().toLowerCase() ?? "";

  return orders.filter((order) => {
    if (normalizedQuery.length > 0 && !order.orderId.toLowerCase().includes(normalizedQuery)) {
      return false;
    }

    if (normalizedStatus.length > 0) {
      const statusValue = (order.status ?? order.fulfillment?.state ?? "").toLowerCase();
      return statusValue === normalizedStatus;
    }

    return true;
  });
}
