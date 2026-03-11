import { useEffect, useMemo } from "react";
import { useShallow } from "zustand/react/shallow";
import { useNotification } from "../context/useNotification";
import {
  selectOrdersByBucket,
  selectOrdersFiltered,
  selectOrdersSortedByEffectiveDateDesc,
  selectOrdersSortedByUrgency,
  useDashboardStore,
  type OrderBucket,
} from "../store/dashboardStore";

export function useOrdersViewModel(accountId: string, activeTab: OrderBucket) {
  const { notifyError } = useNotification();

  const { status, errorMessage, isRefreshing, ensureLoaded, refresh } = useDashboardStore(
    useShallow((state) => ({
      status: state.status,
      errorMessage: state.errorMessage,
      isRefreshing: state.isRefreshing,
      ensureLoaded: state.ensureLoaded,
      refresh: state.refresh,
    }))
  );

  const inProgressOrders = useDashboardStore((state) => selectOrdersByBucket(state, "inProgress"));
  const activeOrders = useDashboardStore((state) => selectOrdersByBucket(state, "active"));
  const pastOrders = useDashboardStore((state) => selectOrdersByBucket(state, "past"));

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

  const currentOrders = useMemo(() => {
    if (activeTab === "inProgress") {
      return selectOrdersSortedByUrgency(inProgressOrders);
    }

    if (activeTab === "active") {
      return selectOrdersSortedByEffectiveDateDesc(activeOrders);
    }

    return selectOrdersSortedByEffectiveDateDesc(pastOrders);
  }, [activeTab, activeOrders, inProgressOrders, pastOrders]);

  const filteredOrders = useMemo(
    () => selectOrdersFiltered(currentOrders, {}),
    [currentOrders]
  );

  return {
    isInitialLoading: status === "loading" && filteredOrders.length === 0,
    isRefreshing,
    errorMessage,
    tabCounts: {
      inProgress: inProgressOrders.length,
      active: activeOrders.length,
      past: pastOrders.length,
    },
    currentOrders: filteredOrders,
    async refresh(): Promise<void> {
      if (!accountId.trim()) {
        notifyError("Account identifier is unavailable.");
        return;
      }

      await refresh(accountId);
    },
  };
}
