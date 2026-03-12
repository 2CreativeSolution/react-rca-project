import { Stack } from "@mui/material";
import { useAuth } from "../context/useAuth";
import { useDashboardViewModel } from "../hooks/useDashboardViewModel";
import {
  DashboardContent,
  DashboardError,
  DashboardHeaderActions,
  DashboardKpiStrip,
} from "../components/dashboard/sections";

export default function Dashboard() {
  const { rcaIdentity } = useAuth();
  const accountId = rcaIdentity?.accountId ?? "";

  const viewModel = useDashboardViewModel(accountId);

  return (
    <Stack spacing={2.5} sx={{ py: 1 }}>
      <DashboardHeaderActions
        fetchedAtLabel={viewModel.fetchedAtLabel}
        isRefreshing={viewModel.isRefreshing}
        disableRefresh={!accountId.trim()}
        onRefresh={viewModel.refresh}
      />

      <DashboardError errorMessage={viewModel.errorMessage} hideOnData={Boolean(viewModel.kpis)} />

      <DashboardKpiStrip
        isLoading={viewModel.isInitialLoading}
        kpis={viewModel.kpis}
        orderHealth={viewModel.orderHealth}
      />

      <DashboardContent
        orderHealth={viewModel.orderHealth}
        activationHighlights={viewModel.activationHighlights}
        quotesPreview={viewModel.quotesPreview}
        assetsPreview={viewModel.assetsPreview}
      />
    </Stack>
  );
}
