import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import ExpandMoreOutlinedIcon from "@mui/icons-material/ExpandMoreOutlined";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Chip,
  Divider,
  Dialog,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import type { ProductSummary } from "../../services/salesforceApi";
import { formatAvailabilityDate, formatBooleanLabel } from "./formatters";

type ProductDetailsLabels = {
  activeLabel: string;
  autoRenewLabel: string;
  availabilityLabel: string;
  categoryLabel: string;
  closeDetailsAriaLabel: string;
  defaultOptionLabel: string;
  detailsTitleFallback: string;
  descriptionTitle: string;
  descriptionUnavailableLabel: string;
  inactiveLabel: string;
  modelStatusLabel: string;
  modelTypeLabel: string;
  noLabel: string;
  notAvailableLabel: string;
  noSellingModelMessage: string;
  attributesTitle: string;
  pricingTermLabel: string;
  pricingTermUnitLabel: string;
  productCodeLabel: string;
  productIdLabel: string;
  sellingModelsTitle: string;
  yesLabel: string;
};

type ProductDetailsDialogProps = {
  labels: ProductDetailsLabels;
  onClose: () => void;
  product: ProductSummary | null;
};

export default function ProductDetailsDialog({ labels, onClose, product }: ProductDetailsDialogProps) {
  return (
    <Dialog
      open={Boolean(product)}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      PaperProps={{
        sx: (theme) => ({
          borderRadius: 3,
          border: "1px solid",
          borderColor: "divider",
          backgroundColor: alpha(theme.palette.background.paper, 0.96),
          backdropFilter: "blur(10px)",
        }),
      }}
    >
      <DialogTitle sx={{ px: { xs: 2, sm: 3 }, py: { xs: 1.75, sm: 2.25 }, pb: 1.5 }}>
        <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={2}>
          <Stack spacing={1}>
            <Typography variant="h6" sx={{ lineHeight: 1.35 }}>
              {product?.name ?? labels.detailsTitleFallback}
            </Typography>
            <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" sx={{ pt: 0.25 }}>
              <Chip
                size="small"
                label={formatBooleanLabel(
                  product?.isActive,
                  labels.activeLabel,
                  labels.inactiveLabel,
                  labels.notAvailableLabel
                )}
                color={product?.isActive ? "success" : "default"}
                variant="outlined"
              />
              <Chip
                size="small"
                label={product?.productSpecificationTypeName ?? labels.notAvailableLabel}
                variant="outlined"
              />
            </Stack>
          </Stack>
          <IconButton onClick={onClose} aria-label={labels.closeDetailsAriaLabel} sx={{ mt: -0.25 }}>
            <CloseOutlinedIcon />
          </IconButton>
        </Stack>
      </DialogTitle>
      <DialogContent
        dividers
        sx={{
          px: { xs: 2, sm: 3 },
          py: { xs: 2, sm: 2.5 },
        }}
      >
        <Stack spacing={3}>
          <Stack spacing={1}>
            <Typography variant="subtitle1">{labels.descriptionTitle}</Typography>
            <Typography variant="body2" color="text.secondary">
              {product?.description?.trim() ? product.description : labels.descriptionUnavailableLabel}
            </Typography>
          </Stack>

          <Divider />

          <Stack spacing={1.5}>
            <Typography variant="subtitle1">{labels.attributesTitle}</Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 6 }}>
                <Stack spacing={0.6}>
                  <Typography variant="caption" color="text.secondary">
                    {labels.productIdLabel}
                  </Typography>
                  <Typography variant="body2">{product?.id ?? labels.notAvailableLabel}</Typography>
                </Stack>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Stack spacing={0.6}>
                  <Typography variant="caption" color="text.secondary">
                    {labels.productCodeLabel}
                  </Typography>
                  <Typography variant="body2">{product?.productCode ?? labels.notAvailableLabel}</Typography>
                </Stack>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Stack spacing={0.6}>
                  <Typography variant="caption" color="text.secondary">
                    {labels.availabilityLabel}
                  </Typography>
                  <Typography variant="body2">
                    {formatAvailabilityDate(product?.availabilityDate, labels.notAvailableLabel)}
                  </Typography>
                </Stack>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Stack spacing={0.6}>
                  <Typography variant="caption" color="text.secondary">
                    {labels.categoryLabel}
                  </Typography>
                  <Typography variant="body2">
                    {product?.categories.length ? product.categories.join(", ") : labels.notAvailableLabel}
                  </Typography>
                </Stack>
              </Grid>
            </Grid>
          </Stack>

          <Stack spacing={1.5} sx={{ borderTop: "1px solid", borderColor: "divider", pt: 2 }}>
            <Typography variant="subtitle1">{labels.sellingModelsTitle}</Typography>
            {product?.productSellingModelOptions.length ? (
              <Stack spacing={1.25} sx={{ pl: { xs: 0.25, sm: 0.75 } }}>
                {product.productSellingModelOptions.map((option, optionIndex) => (
                  <Accordion
                    key={option.id ?? `${product.id ?? "product"}-${optionIndex}`}
                    disableGutters
                    sx={{
                      border: "1px solid",
                      borderColor: "divider",
                      borderRadius: 1.5,
                      overflow: "hidden",
                      "&:before": {
                        display: "none",
                      },
                    }}
                  >
                    <AccordionSummary
                      expandIcon={<ExpandMoreOutlinedIcon />}
                      sx={{
                        px: { xs: 1.5, sm: 2 },
                        py: 0.25,
                        minHeight: 50,
                        "& .MuiAccordionSummary-content": {
                          my: 1,
                        },
                      }}
                    >
                      <Stack direction="row" spacing={1} alignItems="center" useFlexGap flexWrap="wrap">
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {option.model.name ?? labels.notAvailableLabel}
                        </Typography>
                        {option.isDefault ? (
                          <Chip size="small" label={labels.defaultOptionLabel} color="primary" />
                        ) : null}
                      </Stack>
                    </AccordionSummary>
                    <AccordionDetails sx={{ px: { xs: 1.5, sm: 2 }, pb: 2, pt: 0.25 }}>
                      <Grid container spacing={1.75}>
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <Stack spacing={0.6}>
                            <Typography variant="caption" color="text.secondary">
                              {labels.modelTypeLabel}
                            </Typography>
                            <Typography variant="body2">
                              {option.model.sellingModelType ?? labels.notAvailableLabel}
                            </Typography>
                          </Stack>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <Stack spacing={0.6}>
                            <Typography variant="caption" color="text.secondary">
                              {labels.modelStatusLabel}
                            </Typography>
                            <Typography variant="body2">{option.model.status ?? labels.notAvailableLabel}</Typography>
                          </Stack>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <Stack spacing={0.6}>
                            <Typography variant="caption" color="text.secondary">
                              {labels.pricingTermLabel}
                            </Typography>
                            <Typography variant="body2">
                              {option.model.pricingTerm ?? labels.notAvailableLabel}
                            </Typography>
                          </Stack>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <Stack spacing={0.6}>
                            <Typography variant="caption" color="text.secondary">
                              {labels.pricingTermUnitLabel}
                            </Typography>
                            <Typography variant="body2">
                              {option.model.pricingTermUnit ?? labels.notAvailableLabel}
                            </Typography>
                          </Stack>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <Stack spacing={0.6}>
                            <Typography variant="caption" color="text.secondary">
                              {labels.autoRenewLabel}
                            </Typography>
                            <Typography variant="body2">
                              {formatBooleanLabel(
                                option.model.doesAutoRenewByDefault,
                                labels.yesLabel,
                                labels.noLabel,
                                labels.notAvailableLabel
                              )}
                            </Typography>
                          </Stack>
                        </Grid>
                      </Grid>
                    </AccordionDetails>
                  </Accordion>
                ))}
              </Stack>
            ) : (
              <Typography variant="body2" color="text.secondary">
                {labels.noSellingModelMessage}
              </Typography>
            )}
          </Stack>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
