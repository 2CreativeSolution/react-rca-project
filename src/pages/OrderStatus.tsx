import AutorenewRoundedIcon from "@mui/icons-material/AutorenewRounded";
import ErrorOutlineRoundedIcon from "@mui/icons-material/ErrorOutlineRounded";
import TaskAltRoundedIcon from "@mui/icons-material/TaskAltRounded";
import { Alert, Box, Button, CircularProgress, Paper, Stack, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { useEffect, useMemo, useState } from "react";
import { Link as RouterLink, useLocation, useNavigate } from "react-router-dom";
import { PRODUCT_COPY } from "../constants/productContent";
import { ROUTES } from "../constants/routes";
import { useNotification } from "../context/useNotification";
import { getOrderStatus } from "../services/salesforceApi";

const ORDER_STATUS_POLL_INTERVAL_MS = 3000;
const ORDER_STATUS_TIMEOUT_MS = 120000;

type CheckoutRouteState = {
  quoteId: string;
  quoteName?: string | null;
  lineItems: unknown[];
  totals: unknown;
  totalsComputation: unknown;
};

type OrderStatusRouteState = {
  quoteId?: string;
  quoteDisplayValue?: string;
  jobId?: string | null;
  checkoutState?: CheckoutRouteState;
};

export default function OrderStatus() {
  const orderStatusCopy = PRODUCT_COPY.orderStatus;
  const location = useLocation();
  const navigate = useNavigate();
  const { notifyError, notifySuccess } = useNotification();
  const [lastErrorMessage, setLastErrorMessage] = useState<string | null>(null);
  const [retryToken, setRetryToken] = useState(0);
  const routeState = location.state as OrderStatusRouteState | null;

  const quoteId = routeState?.quoteId?.trim() ?? "";
  const hasOrderStatusState = quoteId.length > 0;
  const isPolling = hasOrderStatusState;
  const quoteDisplayValue = routeState?.quoteDisplayValue?.trim() || quoteId || PRODUCT_COPY.checkout.quoteFallbackLabel;
  const jobId = routeState?.jobId?.trim() || null;

  const checkoutNavigationState = useMemo(() => {
    if (!routeState?.checkoutState) {
      return undefined;
    }

    return routeState.checkoutState;
  }, [routeState?.checkoutState]);

  useEffect(() => {
    if (!hasOrderStatusState) {
      return;
    }

    let isCancelled = false;
    let timeoutId: number | undefined;
    const startedAt = Date.now();

    const navigateToCheckout = (message: string): void => {
      notifyError(message);
      navigate(ROUTES.checkout, {
        replace: true,
        state: checkoutNavigationState,
      });
    };

    const pollOrderStatus = async (): Promise<void> => {
      if (isCancelled) {
        return;
      }

      if (Date.now() - startedAt >= ORDER_STATUS_TIMEOUT_MS) {
        navigateToCheckout(orderStatusCopy.timeoutMessage);
        return;
      }

      try {
        const result = await getOrderStatus({ quoteId });

        if (isCancelled) {
          return;
        }

        if (result.status === "Completed") {
          notifySuccess(result.message ?? orderStatusCopy.completedMessage);
          navigate(ROUTES.cart, { replace: true });
          return;
        }

        if (result.status === "Failed") {
          navigateToCheckout(result.message ?? orderStatusCopy.failedMessage);
          return;
        }

        if (result.status === "Unknown") {
          setLastErrorMessage(orderStatusCopy.unexpectedStatusMessage);
          return;
        }

        setLastErrorMessage(null);
      } catch (error) {
        if (isCancelled) {
          return;
        }

        const message = error instanceof Error ? error.message : orderStatusCopy.unexpectedStatusMessage;
        setLastErrorMessage(message);
      }

      timeoutId = window.setTimeout(() => {
        void pollOrderStatus();
      }, ORDER_STATUS_POLL_INTERVAL_MS);
    };

    void pollOrderStatus();

    return () => {
      isCancelled = true;
      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }
    };
  }, [
    checkoutNavigationState,
    hasOrderStatusState,
    navigate,
    notifyError,
    notifySuccess,
    orderStatusCopy.completedMessage,
    orderStatusCopy.failedMessage,
    orderStatusCopy.timeoutMessage,
    orderStatusCopy.unexpectedStatusMessage,
    quoteId,
    retryToken,
  ]);

  if (!hasOrderStatusState) {
    return (
      <Stack spacing={2.5} sx={{ py: 1 }}>
        <Paper variant="outlined" sx={{ borderRadius: 3, p: 2.5 }}>
          <Stack spacing={1.5}>
            <Typography variant="h4">{orderStatusCopy.title}</Typography>
            <Alert severity="warning" variant="outlined">
              {orderStatusCopy.missingStateMessage}
            </Alert>
            <Button component={RouterLink} to={ROUTES.cart} sx={{ alignSelf: "flex-start" }} variant="outlined">
              {orderStatusCopy.backToCartLabel}
            </Button>
          </Stack>
        </Paper>
      </Stack>
    );
  }

  return (
    <Stack spacing={2.5} sx={{ py: 1 }}>
      <Paper
        variant="outlined"
        sx={(theme) => ({
          borderRadius: 3,
          p: { xs: 2, md: 2.5 },
          borderColor: alpha(theme.palette.primary.main, 0.24),
          background: `linear-gradient(155deg, ${alpha(theme.palette.primary.light, 0.12)} 0%, ${alpha(theme.palette.info.light, 0.08)} 45%, ${alpha(theme.palette.background.paper, 0.96)} 100%)`,
        })}
      >
        <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={1.5}>
          <Stack spacing={0.7}>
            <Stack alignItems="center" direction="row" spacing={1}>
              <Box
                sx={(theme) => ({
                  width: 34,
                  height: 34,
                  borderRadius: "50%",
                  display: "grid",
                  placeItems: "center",
                  backgroundColor: alpha(theme.palette.primary.main, 0.14),
                  color: theme.palette.primary.dark,
                })}
              >
                {isPolling ? <AutorenewRoundedIcon fontSize="small" /> : <TaskAltRoundedIcon fontSize="small" />}
              </Box>
              <Typography variant="h4">{orderStatusCopy.title}</Typography>
            </Stack>
            <Typography color="text.secondary" variant="body2">
              {`${orderStatusCopy.quoteLabel}: ${quoteDisplayValue}`}
            </Typography>
            {jobId ? (
              <Typography color="text.secondary" variant="body2">
                {`${orderStatusCopy.jobLabel}: ${jobId}`}
              </Typography>
            ) : null}
          </Stack>

          <Stack direction="row" spacing={1} sx={{ alignSelf: { xs: "flex-start", md: "center" } }}>
            <Button component={RouterLink} to={ROUTES.checkout} state={checkoutNavigationState} variant="outlined">
              {orderStatusCopy.backToCheckoutLabel}
            </Button>
            <Button component={RouterLink} to={ROUTES.cart} variant="outlined">
              {orderStatusCopy.backToCartLabel}
            </Button>
          </Stack>
        </Stack>
      </Paper>

      <Paper variant="outlined" sx={{ borderRadius: 3, p: { xs: 2, md: 2.5 } }}>
        <Stack alignItems="center" spacing={1.5} sx={{ py: 4 }}>
          <CircularProgress size={30} />
          <Typography variant="h6">{orderStatusCopy.processingMessage}</Typography>
          {lastErrorMessage ? (
            <Alert icon={<ErrorOutlineRoundedIcon fontSize="inherit" />} severity="warning" sx={{ width: "100%" }} variant="outlined">
              {lastErrorMessage}
            </Alert>
          ) : null}
          <Button
            onClick={() => {
              setLastErrorMessage(null);
              setRetryToken((previous) => previous + 1);
            }}
            variant="outlined"
          >
            {orderStatusCopy.retryStatusLabel}
          </Button>
        </Stack>
      </Paper>
    </Stack>
  );
}
