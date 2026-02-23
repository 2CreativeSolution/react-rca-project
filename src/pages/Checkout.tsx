import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  Divider,
  FormControlLabel,
  Grid,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { MuiTelInput, type MuiTelInputInfo } from "mui-tel-input";
import { useMemo, useState } from "react";
import { Link as RouterLink, useLocation, useNavigate } from "react-router-dom";
import { formatCurrency } from "../components/cart/formatters";
import { PRODUCT_COPY } from "../constants/productContent";
import { ROUTES } from "../constants/routes";
import { useNotification } from "../context/useNotification";
import {
  createOrdersFromQuote,
  type CartLineItem,
  type CartTotals,
  type CreateOrderAddressData,
  type CheckoutAddressDetails,
  type CheckoutBillingDetails,
  type CreateOrderFromQuoteFuturePayload,
  type CreateOrderFromQuotePayload,
  type TotalsComputationMeta,
} from "../services/salesforceApi";

type CheckoutRouteState = {
  quoteId: string;
  quoteName?: string | null;
  lineItems: CartLineItem[];
  totals: CartTotals;
  totalsComputation: TotalsComputationMeta;
};

type ContactFormState = {
  fullName: string;
  email: string;
  phoneValue: string;
  phoneCountryCode: string;
  phoneNumber: string;
};

type BillingFormState = {
  contact: ContactFormState;
  billingAddress: CheckoutAddressDetails;
  shippingAddress: CheckoutAddressDetails;
  useBillingAsShipping: boolean;
};

const INITIAL_ADDRESS_STATE: CheckoutAddressDetails = {
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  postalCode: "",
  country: "",
};

const INITIAL_BILLING_FORM_STATE: BillingFormState = {
  contact: {
    fullName: "",
    email: "",
    phoneValue: "+1",
    phoneCountryCode: "+1",
    phoneNumber: "",
  },
  billingAddress: INITIAL_ADDRESS_STATE,
  shippingAddress: INITIAL_ADDRESS_STATE,
  useBillingAsShipping: true,
};

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

function normalizePhone(countryCode: string, phoneNumber: string): string {
  return `${countryCode}${phoneNumber}`.replace(/\s+/g, "");
}

function toCreateOrderFromQuotePayload(payload: CreateOrderFromQuoteFuturePayload): CreateOrderFromQuotePayload {
  const billingContact = payload.billing.contact;
  const billingAddress = payload.billing.billingAddress;
  const shippingAddress = payload.billing.shippingAddress;
  const normalizedFullName = billingContact.fullName.trim();
  const addressData: CreateOrderAddressData = {
    billingToName: normalizedFullName,
    billingStreet: billingAddress.addressLine1.trim(),
    billingCity: billingAddress.city.trim(),
    billingState: billingAddress.state.trim(),
    billingPostalCode: billingAddress.postalCode.trim(),
    billingCountry: billingAddress.country.trim(),
    shippingToName: normalizedFullName,
    shippingStreet: shippingAddress.addressLine1.trim(),
    shippingCity: shippingAddress.city.trim(),
    shippingState: shippingAddress.state.trim(),
    shippingPostalCode: shippingAddress.postalCode.trim(),
    shippingCountry: shippingAddress.country.trim(),
    email: billingContact.email.trim(),
    phone: normalizePhone(billingContact.phoneCountryCode, billingContact.phoneNumber),
  };

  return {
    quoteId: payload.quoteId,
    addressData,
  };
}

function validateAddress(
  address: CheckoutAddressDetails,
  sectionTitle: string,
  checkoutCopy: typeof PRODUCT_COPY.checkout
): string | null {
  if (!address.addressLine1.trim()) {
    return `${sectionTitle}: ${checkoutCopy.addressRequiredMessage}`;
  }
  if (!address.city.trim()) {
    return `${sectionTitle}: ${checkoutCopy.cityRequiredMessage}`;
  }
  if (!address.state.trim()) {
    return `${sectionTitle}: ${checkoutCopy.stateRequiredMessage}`;
  }
  if (!address.postalCode.trim()) {
    return `${sectionTitle}: ${checkoutCopy.postalCodeRequiredMessage}`;
  }
  if (!address.country.trim()) {
    return `${sectionTitle}: ${checkoutCopy.countryRequiredMessage}`;
  }

  return null;
}

type AddressFieldsProps = {
  address: CheckoutAddressDetails;
  disabled?: boolean;
  onAddressChange: (field: keyof CheckoutAddressDetails, value: string) => void;
  checkoutCopy: typeof PRODUCT_COPY.checkout;
};

function AddressFields({ address, disabled, onAddressChange, checkoutCopy }: AddressFieldsProps) {
  return (
    <Grid container spacing={1.25}>
      <Grid size={{ xs: 12 }}>
        <TextField
          label={checkoutCopy.addressLine1Label}
          value={address.addressLine1}
          onChange={(event) => onAddressChange("addressLine1", event.target.value)}
          required
          size="small"
          fullWidth
          disabled={disabled}
        />
      </Grid>
      <Grid size={{ xs: 12 }}>
        <TextField
          label={checkoutCopy.addressLine2Label}
          value={address.addressLine2}
          onChange={(event) => onAddressChange("addressLine2", event.target.value)}
          size="small"
          fullWidth
          disabled={disabled}
        />
      </Grid>
      <Grid size={{ xs: 12, md: 5 }}>
        <TextField
          label={checkoutCopy.cityLabel}
          value={address.city}
          onChange={(event) => onAddressChange("city", event.target.value)}
          required
          size="small"
          fullWidth
          disabled={disabled}
        />
      </Grid>
      <Grid size={{ xs: 12, md: 3 }}>
        <TextField
          label={checkoutCopy.stateLabel}
          value={address.state}
          onChange={(event) => onAddressChange("state", event.target.value)}
          required
          size="small"
          fullWidth
          disabled={disabled}
        />
      </Grid>
      <Grid size={{ xs: 12, md: 4 }}>
        <TextField
          label={checkoutCopy.postalCodeLabel}
          value={address.postalCode}
          onChange={(event) => onAddressChange("postalCode", event.target.value)}
          required
          size="small"
          fullWidth
          disabled={disabled}
        />
      </Grid>
      <Grid size={{ xs: 12 }}>
        <TextField
          label={checkoutCopy.countryLabel}
          value={address.country}
          onChange={(event) => onAddressChange("country", event.target.value)}
          required
          size="small"
          fullWidth
          disabled={disabled}
        />
      </Grid>
    </Grid>
  );
}

export default function Checkout() {
  const checkoutCopy = PRODUCT_COPY.checkout;
  const { notifyError, notifyWarning } = useNotification();
  const location = useLocation();
  const navigate = useNavigate();
  const [billingForm, setBillingForm] = useState<BillingFormState>(INITIAL_BILLING_FORM_STATE);
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);

  const state = location.state as CheckoutRouteState | null;
  const hasCheckoutState = Boolean(state?.quoteId && state?.lineItems && state?.totals && state?.totalsComputation);

  const orderPayload = useMemo<CreateOrderFromQuoteFuturePayload | null>(() => {
    if (!state) {
      return null;
    }

    const shippingAddress = billingForm.useBillingAsShipping ? billingForm.billingAddress : billingForm.shippingAddress;
    const payloadBilling: CheckoutBillingDetails = {
      contact: billingForm.contact,
      billingAddress: billingForm.billingAddress,
      shippingAddress,
    };

    return {
      quoteId: state.quoteId,
      billing: payloadBilling,
      lineItems: state.lineItems,
      totals: state.totals,
      totalsComputation: state.totalsComputation,
    };
  }, [billingForm, state]);

  const formErrorMessage = useMemo(() => {
    if (!billingForm.contact.fullName.trim()) {
      return checkoutCopy.fullNameRequiredMessage;
    }
    if (!billingForm.contact.email.trim() || !isValidEmail(billingForm.contact.email)) {
      return checkoutCopy.validEmailRequiredMessage;
    }
    if (!billingForm.contact.phoneCountryCode.trim()) {
      return checkoutCopy.countryCodeRequiredMessage;
    }
    if (!billingForm.contact.phoneNumber.trim()) {
      return checkoutCopy.phoneRequiredMessage;
    }

    const billingAddressError = validateAddress(billingForm.billingAddress, checkoutCopy.billingTitle, checkoutCopy);
    if (billingAddressError) {
      return billingAddressError;
    }

    if (!billingForm.useBillingAsShipping) {
      const shippingAddressError = validateAddress(billingForm.shippingAddress, checkoutCopy.shippingTitle, checkoutCopy);
      if (shippingAddressError) {
        return shippingAddressError;
      }
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

  const handleContactChange = (field: keyof ContactFormState, value: string): void => {
    setBillingForm((previous) => ({
      ...previous,
      contact: {
        ...previous.contact,
        [field]: value,
      },
    }));
  };

  const handlePhoneChange = (value: string, info: MuiTelInputInfo): void => {
    setBillingForm((previous) => ({
      ...previous,
      contact: {
        ...previous.contact,
        phoneValue: value,
        phoneCountryCode: info.countryCallingCode ? `+${info.countryCallingCode}` : "",
        phoneNumber: info.nationalNumber ?? "",
      },
    }));
  };

  const handleAddressChange = (
    section: "billingAddress" | "shippingAddress",
    field: keyof CheckoutAddressDetails,
    value: string
  ): void => {
    setBillingForm((previous) => ({
      ...previous,
      [section]: {
        ...previous[section],
        [field]: value,
      },
      ...(section === "billingAddress" && previous.useBillingAsShipping
        ? {
            shippingAddress: {
              ...previous.shippingAddress,
              [field]: value,
            },
          }
        : {}),
    }));
  };

  const handleUseBillingAsShipping = (checked: boolean): void => {
    setBillingForm((previous) => ({
      ...previous,
      useBillingAsShipping: checked,
      shippingAddress: checked ? previous.billingAddress : previous.shippingAddress,
    }));
  };

  const quoteDisplayValue = state.quoteName?.trim() || state.quoteId || checkoutCopy.quoteFallbackLabel;

  const actualPlaceOrder = async (payload: CreateOrderFromQuoteFuturePayload): Promise<void> => {
    setIsSubmittingOrder(true);
    try {
      const result = await createOrdersFromQuote(toCreateOrderFromQuotePayload(payload));
      if (!result.success) {
        throw new Error(result.message ?? checkoutCopy.placeOrderErrorMessage);
      }
      if (!result.queued) {
        throw new Error(checkoutCopy.queueUnavailableMessage);
      }

      navigate(ROUTES.orderStatus, {
        replace: true,
        state: {
          quoteId: payload.quoteId,
          quoteDisplayValue,
          jobId: result.jobId,
          checkoutState: state,
        },
      });
    } catch (error) {
      notifyError(error instanceof Error ? error.message : checkoutCopy.placeOrderErrorMessage);
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  const handlePlaceOrder = async (): Promise<void> => {
    if (formErrorMessage) {
      notifyWarning(formErrorMessage);
      return;
    }

    if (!orderPayload) {
      notifyWarning(checkoutCopy.missingCheckoutStateMessage);
      return;
    }

    void actualPlaceOrder(orderPayload);
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
              {`${checkoutCopy.quoteLabel}: ${quoteDisplayValue}`}
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
            <Stack spacing={2}>
              <Typography variant="h6">{checkoutCopy.contactTitle}</Typography>
              <Grid container spacing={1.25}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    label={checkoutCopy.fullNameLabel}
                    value={billingForm.contact.fullName}
                    onChange={(event) => handleContactChange("fullName", event.target.value)}
                    required
                    size="small"
                    fullWidth
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    label={checkoutCopy.emailLabel}
                    value={billingForm.contact.email}
                    onChange={(event) => handleContactChange("email", event.target.value)}
                    required
                    size="small"
                    type="email"
                    fullWidth
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <MuiTelInput
                    label={checkoutCopy.phoneLabel}
                    value={billingForm.contact.phoneValue}
                    onChange={handlePhoneChange}
                    required
                    size="small"
                    fullWidth
                    forceCallingCode
                    defaultCountry="US"
                  />
                </Grid>
              </Grid>

              <Divider />

              <Typography variant="h6">{checkoutCopy.billingTitle}</Typography>
              <AddressFields
                address={billingForm.billingAddress}
                checkoutCopy={checkoutCopy}
                onAddressChange={(field, value) => handleAddressChange("billingAddress", field, value)}
              />

              <Divider />

              <Stack spacing={0.5}>
                <Typography variant="h6">{checkoutCopy.shippingTitle}</Typography>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={billingForm.useBillingAsShipping}
                      onChange={(event) => handleUseBillingAsShipping(event.target.checked)}
                    />
                  }
                  label={checkoutCopy.sameAsBillingLabel}
                />
              </Stack>
              <AddressFields
                address={billingForm.useBillingAsShipping ? billingForm.billingAddress : billingForm.shippingAddress}
                checkoutCopy={checkoutCopy}
                disabled={billingForm.useBillingAsShipping}
                onAddressChange={(field, value) => handleAddressChange("shippingAddress", field, value)}
              />
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
