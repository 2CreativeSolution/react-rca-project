import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import HelpOutlineRoundedIcon from "@mui/icons-material/HelpOutlineRounded";
import ScheduleRoundedIcon from "@mui/icons-material/ScheduleRounded";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import { Box, Button, ButtonBase, CircularProgress, Paper, Stack, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { useEffect, useMemo, useState } from "react";
import type { ProductSummary } from "../../services/salesforceApi";
import { formatProductPrice, resolveAvailabilityStatus, toProductInitials } from "./formatters";

type ProductListLabels = {
  addToCartCtaLabel: string;
  addingToCartCtaLabel: string;
  emptyCatalogMessage: string;
  emptyMessage: string;
  loadingMessage: string;
  notAvailableLabel: string;
  priceLabel: string;
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
  const [failedImageUrls, setFailedImageUrls] = useState<Record<string, true>>({});
  const [nowTimestamp, setNowTimestamp] = useState(() => Date.now());

  const availabilityBadgeMap = useMemo(() => ({
    available: {
      icon: <CheckCircleRoundedIcon fontSize="small" />,
      color: "success.main",
    },
    unavailable: {
      icon: <ScheduleRoundedIcon fontSize="small" />,
      color: "warning.dark",
    },
    unknown: {
      icon: <HelpOutlineRoundedIcon fontSize="small" />,
      color: "text.secondary",
    },
  }), []);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setNowTimestamp(Date.now());
    }, 60_000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

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
          {products.map((product, index) => {
            const availabilityStatus = resolveAvailabilityStatus(product, nowTimestamp);
            const availabilityBadge = availabilityBadgeMap[availabilityStatus];
            const displayPrice = formatProductPrice(product, labels.notAvailableLabel);
            const productHasImage = Boolean(product.imageUrl && failedImageUrls[product.imageUrl] !== true);

            return (
            <Paper
              key={product.id ?? index}
              variant="outlined"
              sx={(theme) => ({
                borderRadius: 3,
                overflow: "hidden",
                borderColor: alpha(theme.palette.primary.main, 0.2),
                boxShadow: `0 8px 22px ${alpha(theme.palette.common.black, 0.09)}`,
                background: `linear-gradient(160deg, ${alpha(theme.palette.background.paper, 0.97)} 0%, ${alpha(theme.palette.info.light, 0.04)} 100%)`,
                transition: "transform 240ms ease, box-shadow 260ms ease, border-color 260ms ease",
                display: "flex",
                flexDirection: "column",
                minHeight: { xs: 290, md: 360 },
                "&:hover": {
                  transform: "translateY(-3px)",
                  borderColor: alpha(theme.palette.primary.main, 0.36),
                  boxShadow: `0 16px 28px ${alpha(theme.palette.primary.dark, 0.15)}`,
                },
              })}
            >
              <ButtonBase
                onClick={() => onSelectProduct(product)}
                sx={(theme) => ({
                  width: "100%",
                  textAlign: "left",
                  px: 0,
                  pt: 0,
                  pb: 0,
                  display: "flex",
                  flex: 1,
                  alignItems: "stretch",
                  justifyContent: "stretch",
                  transition: "background-color 220ms ease, transform 240ms ease",
                  backgroundColor: "transparent",
                  "&:hover": {
                    backgroundColor: alpha(theme.palette.background.paper, 0.15),
                  },
                  "&:hover img": {
                    transform: "scale(1.02)",
                  },
                })}
              >
                <Stack spacing={0} sx={{ width: "100%", minHeight: "100%" }}>
                  <Box
                    sx={(theme) => ({
                      position: "relative",
                      height: { xs: 168, md: 200 },
                      borderBottom: "1px solid",
                      borderColor: alpha(theme.palette.divider, 0.68),
                      background: `radial-gradient(circle at 18% 14%, ${alpha(theme.palette.info.light, 0.18)} 0%, ${alpha(theme.palette.primary.light, 0.13)} 34%, ${alpha(theme.palette.background.default, 0.16)} 100%)`,
                      overflow: "hidden",
                    })}
                  >
                    {productHasImage ? (
                      <Box
                        component="img"
                        src={product.imageUrl}
                        alt={`${product.name} image`}
                        loading="lazy"
                        onError={() => {
                          const imageUrl = product.imageUrl;
                          if (!imageUrl) {
                            return;
                          }

                          setFailedImageUrls((previousState) => {
                            if (previousState[imageUrl]) {
                              return previousState;
                            }

                            return {
                              ...previousState,
                              [imageUrl]: true,
                            };
                          });
                        }}
                        sx={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          display: "block",
                          transition: "transform 260ms ease",
                        }}
                      />
                    ) : (
                      <Stack
                        alignItems="center"
                        justifyContent="center"
                        sx={(theme) => ({
                          height: "100%",
                          width: "100%",
                          background: `linear-gradient(145deg, ${alpha(theme.palette.primary.light, 0.16)} 0%, ${alpha(theme.palette.info.light, 0.11)} 35%, ${alpha(theme.palette.background.paper, 0.88)} 100%)`,
                        })}
                      >
                        <Box
                          sx={(theme) => ({
                            width: 68,
                            height: 68,
                            borderRadius: "50%",
                            display: "grid",
                            placeItems: "center",
                            fontSize: "1.25rem",
                            fontWeight: 700,
                            letterSpacing: "0.02em",
                            color: theme.palette.primary.dark,
                            border: "1px solid",
                            borderColor: alpha(theme.palette.primary.main, 0.24),
                            backgroundColor: alpha(theme.palette.background.paper, 0.68),
                            boxShadow: `0 8px 18px ${alpha(theme.palette.primary.dark, 0.12)}`,
                          })}
                        >
                          {toProductInitials(product.name, labels.notAvailableLabel)}
                        </Box>
                      </Stack>
                    )}

                  </Box>

                  <Stack spacing={0.8} sx={{ px: 2, py: 1.65, minHeight: 112 }}>
                    <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={1}>
                      <Typography
                        variant="subtitle1"
                        sx={{
                          fontWeight: 700,
                          letterSpacing: "-0.012em",
                          lineHeight: 1.28,
                          display: "-webkit-box",
                          overflow: "hidden",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          flex: 1,
                        }}
                      >
                        {product.name}
                      </Typography>
                      <Box
                        sx={(theme) => ({
                          width: 30,
                          height: 30,
                          borderRadius: "50%",
                          display: "grid",
                          placeItems: "center",
                          color: availabilityBadge.color,
                          backgroundColor:
                            availabilityStatus === "available"
                              ? alpha(theme.palette.success.light, 0.32)
                              : availabilityStatus === "unavailable"
                                ? alpha(theme.palette.warning.light, 0.34)
                                : alpha(theme.palette.grey[500], 0.2),
                          border: "1px solid",
                          borderColor: alpha(theme.palette.background.paper, 0.72),
                          p: 0.5,
                          flexShrink: 0,
                        })}
                      >
                        {availabilityBadge.icon}
                      </Box>
                    </Stack>
                    <Typography
                      variant="body2"
                      sx={(theme) => ({
                        fontWeight: 600,
                        color: theme.palette.text.primary,
                      })}
                    >
                      {`${labels.priceLabel}: ${displayPrice}`}
                    </Typography>
                    {product.description?.trim() ? (
                      <Typography
                        color="text.secondary"
                        variant="body2"
                        sx={{
                          lineHeight: 1.4,
                          display: "-webkit-box",
                          overflow: "hidden",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          minHeight: "2.8em",
                        }}
                      >
                        {product.description}
                      </Typography>
                    ) : null}
                  </Stack>
                </Stack>
              </ButtonBase>
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="flex-end"
                sx={(theme) => ({
                  px: 2,
                  pb: 1.4,
                  pt: 0.95,
                  borderTop: "1px solid",
                  borderColor: alpha(theme.palette.divider, 0.74),
                  backgroundColor: alpha(theme.palette.background.paper, 0.56),
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
          );
          })}
        </Box>
      )}
    </Paper>
  );
}
