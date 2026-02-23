import { Alert, CircularProgress, Chip, Grid, Paper, Stack, Typography } from "@mui/material";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import CartLineList from "../components/cart/CartLineList";
import CartSummary from "../components/cart/CartSummary";
import { ROUTES } from "../constants/routes";
import { PRODUCT_COPY } from "../constants/productContent";
import { useAuth } from "../context/useAuth";
import { useNotification } from "../context/useNotification";
import {
  editProductsToCart,
  getQuotesWithQuoteLines,
  removeProductsToCart,
  type CartLineItem,
  type CartQuote,
} from "../services/salesforceApi";

type CartLineDraft = {
  quantity: string;
};

export default function Cart() {
  const cartCopy = PRODUCT_COPY.cart;
  const { decisionSession } = useAuth();
  const { notifyError, notifySuccess, notifyWarning } = useNotification();
  const navigate = useNavigate();

  const quoteId = decisionSession.quoteId?.trim() ?? "";

  const [cartQuote, setCartQuote] = useState<CartQuote | null>(null);
  const [drafts, setDrafts] = useState<Record<string, CartLineDraft>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [linePendingId, setLinePendingId] = useState<string | null>(null);

  const missingQuoteWarningShownRef = useRef(false);

  const initializeDrafts = useCallback((lineItems: CartLineItem[]) => {
    setDrafts(
      lineItems.reduce<Record<string, CartLineDraft>>((acc, line) => {
        acc[line.uiId] = {
          quantity: line.quantity?.toString() ?? "",
        };
        return acc;
      }, {})
    );
  }, []);

  const loadCart = useCallback(async () => {
    if (!quoteId) {
      setCartQuote(null);
      setDrafts({});
      setIsLoading(false);
      if (!missingQuoteWarningShownRef.current) {
        notifyWarning(cartCopy.missingQuoteWarning);
        missingQuoteWarningShownRef.current = true;
      }
      return;
    }

    missingQuoteWarningShownRef.current = false;
    setIsLoading(true);

    try {
      const quote = await getQuotesWithQuoteLines({ quoteId });
      const normalizedQuote = {
        ...quote,
        quoteId: quote.quoteId || quoteId,
      };
      setCartQuote(normalizedQuote);
      initializeDrafts(normalizedQuote.lineItems);
    } catch (error) {
      setCartQuote(null);
      notifyError(error instanceof Error ? error.message : cartCopy.loadErrorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [cartCopy.loadErrorMessage, cartCopy.missingQuoteWarning, initializeDrafts, notifyError, notifyWarning, quoteId]);

  useEffect(() => {
    void loadCart();
  }, [loadCart]);

  const handleDraftChange = useCallback((lineId: string, patch: Partial<CartLineDraft>) => {
    setDrafts((previous) => ({
      ...previous,
      [lineId]: {
        ...(previous[lineId] ?? { quantity: "" }),
        ...patch,
      },
    }));
  }, []);

  const handleSaveLine = useCallback(
    async (line: CartLineItem) => {
      if (!quoteId) {
        notifyWarning(cartCopy.missingQuoteWarning);
        return;
      }

      if (!line.quoteLineItemId) {
        notifyWarning(cartCopy.missingLineIdWarning);
        return;
      }

      const draft = drafts[line.uiId] ?? {
        quantity: line.quantity?.toString() ?? "",
      };

      const nextQuantity = draft.quantity.trim();
      const updates: { Quantity?: string } = {};

      if (nextQuantity.length > 0) {
        const quantityNumber = Number(nextQuantity);
        if (!Number.isFinite(quantityNumber) || quantityNumber <= 0) {
          notifyWarning(cartCopy.invalidInputWarning);
          return;
        }

        if (line.quantity === null || quantityNumber !== line.quantity) {
          updates.Quantity = nextQuantity;
        }
      }

      if (!updates.Quantity) {
        notifyWarning(cartCopy.noChangesWarning);
        return;
      }

      setLinePendingId(line.uiId);
      try {
        const result = await editProductsToCart({
          quoteID: quoteId,
          quoteLineItemID: line.quoteLineItemId,
          productsToAddList: [updates],
        });

        if (!result.isSuccess) {
          throw new Error(result.message ?? cartCopy.loadErrorMessage);
        }

        notifySuccess(result.message ?? cartCopy.updateSuccessMessage);
        await loadCart();
      } catch (error) {
        notifyError(error instanceof Error ? error.message : cartCopy.loadErrorMessage);
      } finally {
        setLinePendingId(null);
      }
    },
    [
      cartCopy.invalidInputWarning,
      cartCopy.loadErrorMessage,
      cartCopy.missingLineIdWarning,
      cartCopy.missingQuoteWarning,
      cartCopy.noChangesWarning,
      cartCopy.updateSuccessMessage,
      drafts,
      loadCart,
      notifyError,
      notifySuccess,
      notifyWarning,
      quoteId,
    ]
  );

  const handleRemoveLine = useCallback(
    async (line: CartLineItem) => {
      if (!quoteId) {
        notifyWarning(cartCopy.missingQuoteWarning);
        return;
      }

      if (!line.quoteLineItemId) {
        notifyWarning(cartCopy.missingLineIdWarning);
        return;
      }

      // TODO(BE dependency): removeProductsToCart requires Product2Id in payload.
      // Keep this guard until cart API reliably returns Product2Id for each line item.
      if (!line.productId) {
        notifyError(cartCopy.loadErrorMessage);
        return;
      }

      setLinePendingId(line.uiId);
      try {
        const result = await removeProductsToCart({
          quoteID: quoteId,
          quoteLineItemID: line.quoteLineItemId,
          productsToAddList: [{ Product2Id: line.productId }],
        });

        if (!result.isSuccess) {
          throw new Error(result.message ?? cartCopy.loadErrorMessage);
        }

        notifySuccess(result.message ?? cartCopy.removeSuccessMessage);
        await loadCart();
      } catch (error) {
        notifyError(error instanceof Error ? error.message : cartCopy.loadErrorMessage);
      } finally {
        setLinePendingId(null);
      }
    },
    [
      cartCopy.loadErrorMessage,
      cartCopy.missingLineIdWarning,
      cartCopy.missingQuoteWarning,
      cartCopy.removeSuccessMessage,
      loadCart,
      notifyError,
      notifySuccess,
      notifyWarning,
      quoteId,
    ]
  );

  const handlePlaceOrder = useCallback(() => {
    if (!quoteId) {
      notifyWarning(cartCopy.missingQuoteWarning);
      return;
    }

    if (!cartQuote || cartQuote.lineItems.length === 0) {
      notifyWarning(cartCopy.emptyCartMessage);
      return;
    }

    navigate(ROUTES.checkout, {
      state: {
        quoteId,
        lineItems: cartQuote.lineItems,
        totals: cartQuote.totals,
        totalsComputation: cartQuote.totalsComputation,
      },
    });
  }, [cartCopy.emptyCartMessage, cartCopy.missingQuoteWarning, cartQuote, navigate, notifyWarning, quoteId]);

  const isMissingQuote = !quoteId;
  const lineItems = cartQuote?.lineItems ?? [];
  const hasItems = lineItems.length > 0;

  const summary = useMemo(() => {
    if (!cartQuote) {
      return {
        itemCount: 0,
        totalAmount: null,
        currencyCode: "USD",
      };
    }
    return cartQuote.totals;
  }, [cartQuote]);

  return (
    <Stack spacing={2.5} sx={{ py: 1 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Typography variant="h4">{cartCopy.title}</Typography>
        {quoteId ? <Chip color="primary" label={`Quote: ${quoteId}`} variant="outlined" /> : null}
      </Stack>

      {isMissingQuote ? (
        <Alert severity="warning" variant="outlined">
          {cartCopy.missingQuoteWarning}
        </Alert>
      ) : null}

      {isLoading ? (
        <Paper variant="outlined" sx={{ borderRadius: 2.5, py: 8 }}>
          <Stack alignItems="center" spacing={1.5}>
            <CircularProgress size={28} />
            <Typography color="text.secondary" variant="body2">
              {cartCopy.loadingMessage}
            </Typography>
          </Stack>
        </Paper>
      ) : !isMissingQuote && !hasItems ? (
        <Paper variant="outlined" sx={{ borderRadius: 2.5, p: 3 }}>
          <Typography color="text.secondary" variant="body1">
            {cartCopy.emptyCartMessage}
          </Typography>
        </Paper>
      ) : hasItems && cartQuote ? (
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, lg: 8 }}>
            <CartLineList
              currencyCode={summary.currencyCode}
              lines={lineItems}
              linePendingId={linePendingId}
              drafts={drafts}
              labels={{
                actionsLabel: cartCopy.actionsLabel,
                itemsTitle: cartCopy.itemsTitle,
                lineTotalLabel: cartCopy.lineTotalLabel,
                productLabel: cartCopy.productLabel,
                quantityLabel: cartCopy.quantityLabel,
                removeLabel: cartCopy.removeLabel,
                saveLabel: cartCopy.saveLabel,
                unitPriceLabel: cartCopy.unitPriceLabel,
              }}
              onDraftChange={handleDraftChange}
              onSave={handleSaveLine}
              onRemove={handleRemoveLine}
            />
          </Grid>
          <Grid size={{ xs: 12, lg: 4 }}>
            <CartSummary
              totals={summary}
              totalsComputation={cartQuote.totalsComputation}
              isPlacingOrder={false}
              labels={{
                fallbackTotalWarningMessage: cartCopy.fallbackTotalWarningMessage,
                itemCountLabel: cartCopy.itemCountLabel,
                placeOrderLabel: cartCopy.placeOrderLabel,
                summaryTitle: cartCopy.summaryTitle,
                totalLabel: cartCopy.totalLabel,
              }}
              onPlaceOrder={handlePlaceOrder}
            />
          </Grid>
        </Grid>
      ) : null}
    </Stack>
  );
}
