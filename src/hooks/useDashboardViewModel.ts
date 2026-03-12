import { useEffect, useMemo } from "react";
import { useShallow } from "zustand/react/shallow";
import { useNotification } from "../context/useNotification";
import {
  selectAiInsights,
  selectAssets,
  selectKpis,
  selectOrdersByBucket,
  selectQuotes,
  selectOrdersSortedByUrgency,
  useDashboardStore,
} from "../store/dashboardStore";
import type { DashboardOrder } from "../services/salesforceApi";

function formatFetchedAt(fetchedAt: string | null): string {
  if (!fetchedAt) {
    return "Not updated yet";
  }

  const parsed = new Date(fetchedAt);
  if (Number.isNaN(parsed.getTime())) {
    return "Not updated yet";
  }

  return parsed.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function toOrderHealth(inProgressOrders: DashboardOrder[], activeOrders: DashboardOrder[], pastOrders: DashboardOrder[]) {
  const delayedCount = [...inProgressOrders, ...activeOrders].filter(
    (order) => order.fulfillment?.state?.toLowerCase() === "delayed"
  ).length;

  return {
    inProgressCount: inProgressOrders.length,
    activeCount: activeOrders.length,
    delayedCount,
    pastCount: pastOrders.length,
  };
}

export function useDashboardViewModel(accountId: string) {
  const { notifyError } = useNotification();

  const { status, fetchedAt, errorMessage, isRefreshing, ensureLoaded, refresh } = useDashboardStore(
    useShallow((state) => ({
      status: state.status,
      fetchedAt: state.fetchedAt,
      errorMessage: state.errorMessage,
      isRefreshing: state.isRefreshing,
      ensureLoaded: state.ensureLoaded,
      refresh: state.refresh,
    }))
  );

  const kpis = useDashboardStore(selectKpis);
  const inProgressOrders = useDashboardStore((state) => selectOrdersByBucket(state, "inProgress"));
  const activeOrders = useDashboardStore((state) => selectOrdersByBucket(state, "active"));
  const pastOrders = useDashboardStore((state) => selectOrdersByBucket(state, "past"));
  const quotes = useDashboardStore(selectQuotes);
  const assets = useDashboardStore(selectAssets);
  const insights = useDashboardStore(selectAiInsights);

  useEffect(() => {
    if (!accountId.trim()) {
      return;
    }

    void ensureLoaded(accountId);
  }, [accountId, ensureLoaded]);

  useEffect(() => {
    if (!errorMessage) {
      return;
    }

    notifyError(errorMessage);
  }, [errorMessage, notifyError]);

  const orderHealth = useMemo(
    () => toOrderHealth(inProgressOrders, activeOrders, pastOrders),
    [activeOrders, inProgressOrders, pastOrders]
  );

  const activationHighlights = useMemo(() => {
    const prioritizedOrders = selectOrdersSortedByUrgency([...inProgressOrders, ...activeOrders]);
    return prioritizedOrders.slice(0, 2);
  }, [activeOrders, inProgressOrders]);

  return {
    isInitialLoading: status === "loading" && !kpis,
    isRefreshing,
    errorMessage,
    fetchedAtLabel: formatFetchedAt(fetchedAt),
    kpis,
    orderHealth,
    activationHighlights,
    quotesTotal: quotes.length,
    assetsTotal: assets.length,
    quotesPreview: quotes.slice(0, 2),
    assetsPreview: assets.slice(0, 2),
    insights,
    async refresh(): Promise<void> {
      if (!accountId.trim()) {
        notifyError("Account identifier is unavailable.");
        return;
      }

      await refresh(accountId);
    },
  };
}
