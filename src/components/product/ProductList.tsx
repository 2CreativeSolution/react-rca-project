import { alpha } from "@mui/material/styles";
import { Box, Button, ButtonBase, CircularProgress, Paper, Stack, Typography } from "@mui/material";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import type { ProductSummary } from "../../services/salesforceApi";
import { formatAvailabilityDate } from "./formatters";

type ProductListLabels = {
  addToCartCtaLabel: string;
  addingToCartCtaLabel: string;
  availabilityLabel: string;
  emptyCatalogMessage: string;
  emptyMessage: string;
  loadingMessage: string;
  notAvailableLabel: string;
  productCodeLabel: string;
  productIdLabel: string;
};

type ProductListProps = {
  catalogOptionsCount: number;
  isProductsLoading: boolean;
  isAddToCartDisabled?: (product: ProductSummary) => boolean;
  isAddToCartLoading?: (product: ProductSummary) => boolean;
  labels: ProductListLabels;
  onAddToCart: (product: ProductSummary) => void;
  onSelectProduct: (product: ProductSummary) => void;
  products: ProductSummary[];
};

export default function ProductList({
  catalogOptionsCount,
  isProductsLoading,
  isAddToCartDisabled,
  isAddToCartLoading,
  labels,
  onAddToCart,
  onSelectProduct,
  products,
}: ProductListProps) {
  return (
    <Paper variant="outlined" sx={{ borderRadius: 2 }}>
      {catalogOptionsCount === 0 ? (
        <Box sx={{ p: 2.5 }}>
          <Typography color="text.secondary" variant="body1">
            {labels.emptyCatalogMessage}
          </Typography>
        </Box>
      ) : isProductsLoading ? (
        <Stack alignItems="center" justifyContent="center" spacing={1.5} sx={{ py: 8 }}>
          <CircularProgress size={26} />
          <Typography color="text.secondary" variant="body2">
            {labels.loadingMessage}
          </Typography>
        </Stack>
      ) : products.length === 0 ? (
        <Box sx={{ p: 2.5 }}>
          <Typography color="text.secondary" variant="body1">
            {labels.emptyMessage}
          </Typography>
        </Box>
      ) : (
        <Box
          sx={{
            p: 1.25,
            display: "grid",
            gap: 1.25,
            gridTemplateColumns: {
              xs: "minmax(0, 1fr)",
              sm: "repeat(2, minmax(0, 1fr))",
              md: "repeat(3, minmax(0, 1fr))",
              lg: "repeat(4, minmax(0, 1fr))",
            },
          }}
        >
          {products.map((product, index) => (
            <Paper
              key={product.id ?? index}
              variant="outlined"
              sx={(theme) => ({
                borderRadius: 2.5,
                overflow: "hidden",
                borderColor: alpha(theme.palette.primary.main, 0.18),
                boxShadow: `0 4px 16px ${alpha(theme.palette.common.black, 0.08)}`,
                background: `linear-gradient(168deg, ${alpha(theme.palette.background.paper, 0.98)} 0%, ${alpha(theme.palette.info.light, 0.06)} 100%)`,
                transition: "transform 220ms ease, box-shadow 240ms ease, border-color 240ms ease",
                display: "flex",
                flexDirection: "column",
                aspectRatio: { xs: "4 / 3", md: "3 / 4" },
                minHeight: { xs: 220, md: 360 },
                "&:hover": {
                  transform: "translateY(-2px)",
                  borderColor: alpha(theme.palette.primary.main, 0.32),
                  boxShadow: `0 12px 24px ${alpha(theme.palette.primary.dark, 0.14)}`,
                },
              })}
            >
              <ButtonBase
                onClick={() => onSelectProduct(product)}
                sx={(theme) => ({
                  width: "100%",
                  textAlign: "left",
                  px: 2.1,
                  pt: 2,
                  pb: 1.25,
                  display: "flex",
                  flex: 1,
                  alignItems: "flex-start",
                  justifyContent: "flex-start",
                  transition: "background-color 220ms ease",
                  backgroundColor: "transparent",
                  "&:hover": {
                    backgroundColor: alpha(theme.palette.background.paper, 0.18),
                  },
                })}
              >
                <Stack spacing={1.2} sx={{ width: "100%" }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, letterSpacing: "-0.01em", lineHeight: 1.3 }}>
                    {product.name}
                  </Typography>
                  <Typography color="text.secondary" variant="body2">
                    {`${labels.productIdLabel}: ${product.id ?? labels.notAvailableLabel}`}
                  </Typography>
                  <Typography color="text.secondary" variant="body2">
                    {`${labels.productCodeLabel}: ${product.productCode ?? labels.notAvailableLabel}`}
                  </Typography>
                  <Typography color="text.secondary" variant="body2">
                    {`${labels.availabilityLabel}: ${formatAvailabilityDate(product.availabilityDate, labels.notAvailableLabel)}`}
                  </Typography>
                </Stack>
              </ButtonBase>
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="flex-end"
                sx={(theme) => ({
                  px: 2.1,
                  pb: 1.5,
                  pt: 0.9,
                  borderTop: "1px solid",
                  borderColor: alpha(theme.palette.divider, 0.8),
                  backgroundColor: alpha(theme.palette.background.paper, 0.6),
                })}
              >
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<ShoppingCartOutlinedIcon fontSize="small" />}
                  disabled={isAddToCartDisabled?.(product) ?? false}
                  onClick={() => onAddToCart(product)}
                >
                  {isAddToCartLoading?.(product) ? labels.addingToCartCtaLabel : labels.addToCartCtaLabel}
                </Button>
              </Stack>
            </Paper>
          ))}
        </Box>
      )}
    </Paper>
  );
}
