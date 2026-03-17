import { Stack } from "@mui/material";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PRODUCT_COPY } from "../constants/productContent";
import { useAuth } from "../context/useAuth";
import { useNotification } from "../context/useNotification";
import { ROUTES } from "../constants/routes";
import { useDashboardViewModel } from "../hooks/useDashboardViewModel";
import { evaluateDecision } from "../services/salesforceApi";
import {
  DashboardContent,
  DashboardError,
  DashboardHeaderActions,
  DashboardKpiStrip,
} from "../components/dashboard/sections";

export default function Dashboard() {
  const dashboardCopy = PRODUCT_COPY.dashboard;
  const navigate = useNavigate();
  const { notifySuccess, notifyWarning } = useNotification();
  const { rcaIdentity, decisionSession, initializeDefaultQuote, setDecisionSession } = useAuth();
  const [isCreatingQuote, setIsCreatingQuote] = useState(false);
  const accountId = rcaIdentity?.accountId ?? "";
  const contactId = rcaIdentity?.contactId ?? "";

  const viewModel = useDashboardViewModel(accountId);

  const handleCreateQuote = async () => {
    if (!accountId.trim() || !contactId.trim() || !rcaIdentity) {
      notifyWarning(dashboardCopy.missingIdentityWarningMessage);
      return;
    }

    setIsCreatingQuote(true);
    try {
      const result = await initializeDefaultQuote(rcaIdentity);
      if (!result.success) {
        notifyWarning(dashboardCopy.createQuoteFailureWarningMessage);
        return;
      }

      let shouldNavigateToCart = false;
      try {
        const decision = await evaluateDecision();
        setDecisionSession(decision);
        shouldNavigateToCart = decision.isActiveQuote && Boolean(decision.quoteId?.trim());
      } catch {
        notifyWarning(dashboardCopy.decisionRefreshWarningMessage);
        return;
      }

      if (!shouldNavigateToCart) {
        notifyWarning(dashboardCopy.missingActiveQuoteWarningMessage);
        return;
      }

      notifySuccess(dashboardCopy.createQuoteSuccessMessage);
      navigate(ROUTES.cart);
    } finally {
      setIsCreatingQuote(false);
    }
  };

  return (
    <Stack spacing={2.5} sx={{ py: 1 }}>
      <DashboardHeaderActions
        fetchedAtLabel={viewModel.fetchedAtLabel}
        isRefreshing={viewModel.isRefreshing}
        disableRefresh={!accountId.trim()}
        showCreateQuote={!decisionSession.isActiveQuote}
        isCreatingQuote={isCreatingQuote}
        disableCreateQuote={!accountId.trim() || !contactId.trim()}
        onCreateQuote={handleCreateQuote}
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
        quotesTotal={viewModel.quotesTotal}
        assetsTotal={viewModel.assetsTotal}
        quotesPreview={viewModel.quotesPreview}
        assetsPreview={viewModel.assetsPreview}
      />
    </Stack>
  );
}
