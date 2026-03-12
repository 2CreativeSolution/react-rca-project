import { Stack } from "@mui/material";
import { useState } from "react";
import { useAuth } from "../context/useAuth";
import { useOrdersViewModel } from "../hooks/useOrdersViewModel";
import type { OrderBucket } from "../store/dashboardStore";
import { OrdersError, OrdersHeader, OrdersList, OrdersTabsBar } from "../components/orders/sections";

export default function Orders() {
  const { rcaIdentity } = useAuth();
  const accountId = rcaIdentity?.accountId ?? "";

  const [activeTab, setActiveTab] = useState<OrderBucket>("inProgress");
  const viewModel = useOrdersViewModel(accountId, activeTab);

  return (
    <Stack spacing={2.5} sx={{ py: 1 }}>
      <OrdersHeader
        disableRefresh={!accountId.trim()}
        isRefreshing={viewModel.isRefreshing}
        onRefresh={viewModel.refresh}
      />

      <OrdersError errorMessage={viewModel.errorMessage} hideOnData={viewModel.currentOrders.length > 0} />

      <OrdersTabsBar activeTab={activeTab} onTabChange={setActiveTab} counts={viewModel.tabCounts} />

      <OrdersList isLoading={viewModel.isInitialLoading} orders={viewModel.currentOrders} />
    </Stack>
  );
}
