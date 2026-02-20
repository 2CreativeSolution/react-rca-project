import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";
import {
  Alert,
  Box,
  Button,
  Chip,
  Divider,
  Grid,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { useMemo, useState } from "react";
import { Link as RouterLink, useLocation, useNavigate } from "react-router-dom";
import { PRODUCT_COPY } from "../constants/productContent";
import { ROUTES } from "../constants/routes";
import { useNotification } from "../context/useNotification";
import {
  createOrdersFromQuote,
  type CartLineItem,
  type CartTotals,
  type TotalsComputationMeta,
} from "../services/salesforceApi";
import { formatCurrency } from "../components/cart/formatters";

type CheckoutRouteState = {
  quoteId: string;
  lineItems: CartLineItem[];
  totals: CartTotals;
  totalsComputation: TotalsComputationMeta;
};

type BillingFormState = {
  fullName: string;
  email: string;
  phone: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
};

const INITIAL_BILLING_FORM_STATE: BillingFormState = {
  fullName: "",
  email: "",
  phone: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  postalCode: "",
  country: "",
};

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export default function Checkout() {
  const checkoutCopy = PRODUCT_COPY.checkout;
  const { notifyError, notifySuccess, notifyWarning } = useNotification();
  const location = useLocation();
  const navigate = useNavigate();
  const [billingForm, setBillingForm] = useState<BillingFormState>(INITIAL_BILLING_FORM_STATE);
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);

  const state = location.state as CheckoutRouteState | null;
  const hasCheckoutState = Boolean(state?.quoteId && state?.lineItems && state?.totals && state?.totalsComputation);

  const formErrorMessage = useMemo(() => {
    if (!billingForm.fullName.trim()) {
      return checkoutCopy.fullNameRequiredMessage;
    }
    if (!billingForm.email.trim() || !isValidEmail(billingForm.email)) {
      return checkoutCopy.validEmailRequiredMessage;
    }
    if (!billingForm.phone.trim()) {
      return checkoutCopy.phoneRequiredMessage;
    }
    if (!billingForm.addressLine1.trim()) {
      return checkoutCopy.addressRequiredMessage;
    }
    if (!billingForm.city.trim()) {
      return checkoutCopy.cityRequiredMessage;
    }
    if (!billingForm.state.trim()) {
      return checkoutCopy.stateRequiredMessage;
    }
    if (!billingForm.postalCode.trim()) {
      return checkoutCopy.postalCodeRequiredMessage;
    }
    if (!billingForm.country.trim()) {
      return checkoutCopy.countryRequiredMessage;
    }
    return null;
  }, [billingForm, checkoutCopy]);

  if (!hasCheckoutState || !state) {
    return (
      <Stack spacing={2.5} sx={{ py: 1 }}>
        <Paper variant="outlined" sx={{ borderRadius: 3, p: 2.5 }}>
          <Stack spacing={1.5}>
            <Typography variant="h4">{checkoutCopy.title}</Typography>
            <Alert severity="warning" variant="outlined">
              {checkoutCopy.missingCheckoutStateMessage}
            </Alert>
            <Button component={RouterLink} to={ROUTES.cart} variant="outlined" sx={{ alignSelf: "flex-start" }}>
              {checkoutCopy.backToCartLabel}
            </Button>
          </Stack>
        </Paper>
      </Stack>
    );
  }

  const handleFieldChange = (field: keyof BillingFormState, value: string): void => {
    setBillingForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const handlePlaceOrder = async (): Promise<void> => {
    if (formErrorMessage) {
      notifyWarning(formErrorMessage);
      return;
    }

    setIsSubmittingOrder(true);
    try {
      const result = await createOrdersFromQuote({ quoteId: state.quoteId });
      if (!result.isSuccess) {
        throw new Error(result.message ?? checkoutCopy.placeOrderErrorMessage);
      }
      notifySuccess(result.message ?? checkoutCopy.placeOrderSuccessMessage);
      navigate(ROUTES.cart, { replace: true });
    } catch (error) {
      notifyError(error instanceof Error ? error.message : checkoutCopy.placeOrderErrorMessage);
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  return (
    <Stack spacing={2.5} sx={{ py: 1 }}>
      <Paper
        variant="outlined"
        sx={(theme) => ({
          borderRadius: 3,
          p: { xs: 2, md: 2.5 },
          borderColor: alpha(theme.palette.primary.main, 0.24),
          background: `linear-gradient(155deg, ${alpha(theme.palette.primary.light, 0.14)} 0%, ${alpha(theme.palette.info.light, 0.1)} 45%, ${alpha(theme.palette.background.paper, 0.96)} 100%)`,
        })}
      >
        <Stack direction={{ xs: "column", md: "row" }} alignItems={{ md: "center" }} justifyContent="space-between" spacing={1.5}>
          <Stack spacing={0.7}>
            <Stack direction="row" alignItems="center" spacing={1}>
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
                <ReceiptLongOutlinedIcon fontSize="small" />
              </Box>
              <Typography variant="h4">{checkoutCopy.title}</Typography>
            </Stack>
            <Typography color="text.secondary" variant="body2">
              {`${checkoutCopy.quoteLabel}: ${state.quoteId}`}
            </Typography>
          </Stack>
          <Button component={RouterLink} to={ROUTES.cart} variant="outlined">
            {checkoutCopy.backToCartLabel}
          </Button>
        </Stack>
      </Paper>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, lg: 7 }}>
          <Paper variant="outlined" sx={{ borderRadius: 3, p: { xs: 2, md: 2.5 } }}>
            <Stack spacing={1.6}>
              <Typography variant="h6">{checkoutCopy.billingTitle}</Typography>
              <Grid container spacing={1.25}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    label={checkoutCopy.fullNameLabel}
                    value={billingForm.fullName}
                    onChange={(event) => handleFieldChange("fullName", event.target.value)}
                    required
                    size="small"
                    fullWidth
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    label={checkoutCopy.emailLabel}
                    value={billingForm.email}
                    onChange={(event) => handleFieldChange("email", event.target.value)}
                    required
                    size="small"
                    type="email"
                    fullWidth
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    label={checkoutCopy.phoneLabel}
                    value={billingForm.phone}
                    onChange={(event) => handleFieldChange("phone", event.target.value)}
                    required
                    size="small"
                    fullWidth
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    label={checkoutCopy.countryLabel}
                    value={billingForm.country}
                    onChange={(event) => handleFieldChange("country", event.target.value)}
                    required
                    size="small"
                    fullWidth
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    label={checkoutCopy.addressLine1Label}
                    value={billingForm.addressLine1}
                    onChange={(event) => handleFieldChange("addressLine1", event.target.value)}
                    required
                    size="small"
                    fullWidth
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    label={checkoutCopy.addressLine2Label}
                    value={billingForm.addressLine2}
                    onChange={(event) => handleFieldChange("addressLine2", event.target.value)}
                    size="small"
                    fullWidth
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 5 }}>
                  <TextField
                    label={checkoutCopy.cityLabel}
                    value={billingForm.city}
                    onChange={(event) => handleFieldChange("city", event.target.value)}
                    required
                    size="small"
                    fullWidth
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 3 }}>
                  <TextField
                    label={checkoutCopy.stateLabel}
                    value={billingForm.state}
                    onChange={(event) => handleFieldChange("state", event.target.value)}
                    required
                    size="small"
                    fullWidth
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <TextField
                    label={checkoutCopy.postalCodeLabel}
                    value={billingForm.postalCode}
                    onChange={(event) => handleFieldChange("postalCode", event.target.value)}
                    required
                    size="small"
                    fullWidth
                  />
                </Grid>
              </Grid>
            </Stack>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, lg: 5 }}>
          <Stack spacing={2} sx={{ position: { lg: "sticky" }, top: { lg: 88 } }}>
            <Paper variant="outlined" sx={{ borderRadius: 3, overflow: "hidden" }}>
              <Box
                sx={(theme) => ({
                  px: 2,
                  py: 1.25,
                  borderBottom: "1px solid",
                  borderColor: alpha(theme.palette.divider, 0.8),
                  backgroundColor: alpha(theme.palette.background.default, 0.46),
                })}
              >
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                  <Typography variant="h6">{checkoutCopy.orderReviewTitle}</Typography>
                  <Chip label={`${state.lineItems.length}`} size="small" />
                </Stack>
              </Box>

              <Stack spacing={1} sx={{ p: 1.4, maxHeight: 360, overflowY: "auto" }}>
                {state.lineItems.map((line) => (
                  <Paper key={line.uiId} variant="outlined" sx={{ borderRadius: 2, p: 1.25 }}>
                    <Stack direction="row" spacing={1} justifyContent="space-between">
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {line.productName}
                      </Typography>
                      <Typography color="text.secondary" variant="caption">
                        {`${checkoutCopy.quantityLabel}: ${line.quantity ?? 0}`}
                      </Typography>
                    </Stack>
                    <Stack direction="row" spacing={1} justifyContent="space-between" sx={{ mt: 0.65 }}>
                      <Typography color="text.secondary" variant="caption">
                        {`${checkoutCopy.unitPriceLabel}: ${formatCurrency(line.unitPrice, state.totals.currencyCode)}`}
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>
                        {formatCurrency(line.lineTotal, state.totals.currencyCode)}
                      </Typography>
                    </Stack>
                  </Paper>
                ))}
              </Stack>
            </Paper>

            <Paper variant="outlined" sx={{ borderRadius: 3, p: 2 }}>
              <Stack spacing={1.2}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <ShoppingBagOutlinedIcon color="primary" fontSize="small" />
                  <Typography variant="h6">{checkoutCopy.summaryTitle}</Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography color="text.secondary" variant="body2">{checkoutCopy.itemCountLabel}</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {state.totals.itemCount}
                  </Typography>
                </Stack>
                <Divider />
                <Stack direction="row" justifyContent="space-between">
                  <Typography color="text.secondary" variant="body2">{checkoutCopy.totalLabel}</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 800 }}>
                    {formatCurrency(state.totals.totalAmount, state.totals.currencyCode)}
                  </Typography>
                </Stack>
                {state.totalsComputation.isFallbackComputed ? (
                  <Alert severity="warning" variant="outlined">
                    {checkoutCopy.fallbackTotalWarningMessage}
                  </Alert>
                ) : null}
                <Button
                  variant="contained"
                  fullWidth
                  disabled={isSubmittingOrder}
                  onClick={() => void handlePlaceOrder()}
                >
                  {isSubmittingOrder ? checkoutCopy.processingLabel : checkoutCopy.placeOrderLabel}
                </Button>
              </Stack>
            </Paper>
          </Stack>
        </Grid>
      </Grid>
    </Stack>
  );
}
