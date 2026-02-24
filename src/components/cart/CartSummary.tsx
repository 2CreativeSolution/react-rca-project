import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";
import { Alert, Button, Paper, Stack, Typography } from "@mui/material";
import type { CartTotals, TotalsComputationMeta } from "../../services/salesforceApi";
import { formatCurrency } from "./formatters";

type CartSummaryProps = {
  totals: CartTotals;
  totalsComputation: TotalsComputationMeta;
  isPlacingOrder: boolean;
  labels: {
    summaryTitle: string;
    itemCountLabel: string;
    totalLabel: string;
    placeOrderLabel: string;
    fallbackTotalWarningMessage: string;
  };
  onPlaceOrder: () => void;
};

export default function CartSummary({ totals, totalsComputation, isPlacingOrder, labels, onPlaceOrder }: CartSummaryProps) {
  return (
    <Paper variant="outlined" sx={{ borderRadius: 2.5, p: 2 }}>
      <Stack spacing={1.5}>
        <Typography variant="h6">{labels.summaryTitle}</Typography>
        <Typography variant="body2">{`${labels.itemCountLabel}: ${totals.itemCount}`}</Typography>
        <Typography variant="body1" sx={{ fontWeight: 700 }}>
          {`${labels.totalLabel}: ${formatCurrency(totals.totalAmount, totals.currencyCode)}`}
        </Typography>
        {totalsComputation.isFallbackComputed ? (
          <Alert severity="warning" variant="outlined">{labels.fallbackTotalWarningMessage}</Alert>
        ) : null}
        <Button
          fullWidth
          variant="contained"
          startIcon={<ShoppingBagOutlinedIcon />}
          disabled={isPlacingOrder || totals.itemCount === 0}
          onClick={onPlaceOrder}
        >
          {labels.placeOrderLabel}
        </Button>
      </Stack>
    </Paper>
  );
}
