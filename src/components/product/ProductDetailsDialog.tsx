import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import ExpandMoreOutlinedIcon from "@mui/icons-material/ExpandMoreOutlined";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import CancelRoundedIcon from "@mui/icons-material/CancelRounded";
import HelpOutlineRoundedIcon from "@mui/icons-material/HelpOutlineRounded";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Avatar,
  Box,
  ButtonBase,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  Paper,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { useMemo, useState, type ReactNode } from "react";
import type { ProductDetails, ProductSummary } from "../../services/salesforceApi";
import { formatAvailabilityDate, formatBooleanLabel, toProductInitials } from "./formatters";

type ProductDetailsLabels = {
  activeLabel: string;
  attributeLabelLabel: string;
  attributesTitle: string;
  autoRenewLabel: string;
  availabilityLabel: string;
  categoryLabel: string;
  closeDetailsAriaLabel: string;
  childItemsQuantityLabel: string;
  childItemsTitle: string;
  defaultOptionLabel: string;
  defaultValueLabel: string;
  detailsTitleFallback: string;
  descriptionTitle: string;
  descriptionUnavailableLabel: string;
  imageGalleryTitle: string;
  imageThumbnailAriaLabel: string;
  inactiveLabel: string;
  modelStatusLabel: string;
  modelTypeLabel: string;
  noAttributesMessage: string;
  noLabel: string;
  nodeTypeLabel: string;
  noChildItemsMessage: string;
  notAvailableLabel: string;
  noSellingModelMessage: string;
  pricingTermLabel: string;
  pricingTermUnitLabel: string;
  sellingModelsTitle: string;
  statusLabel: string;
  yesLabel: string;
};

type ProductDetailsDialogProps = {
  errorMessage: string | null;
  isLoading: boolean;
  labels: ProductDetailsLabels;
  onClose: () => void;
  productDetails: ProductDetails | null;
  productSummary: ProductSummary | null;
};

const THUMBNAIL_SLOTS = 4;
const CHILD_INDENT_UNIT = 2;

function toDisplayValue(value: string | undefined, fallback: string): string {
  return value?.trim() ? value : fallback;
}

export default function ProductDetailsDialog({
  errorMessage,
  isLoading,
  labels,
  onClose,
  productDetails,
  productSummary,
}: ProductDetailsDialogProps) {
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);

  const imageUrls = useMemo(() => productDetails?.imageUrls ?? [], [productDetails?.imageUrls]);
  const normalizedImageIndex =
    imageUrls.length > 0 && selectedImageUrl
      ? Math.max(0, imageUrls.findIndex((url) => url === selectedImageUrl))
      : 0;
  const activeImageUrl = imageUrls[normalizedImageIndex] ?? "";
  const thumbnailValues = imageUrls.length > 0 ? imageUrls : new Array<string>(THUMBNAIL_SLOTS).fill("");

  const sellingModelOptions = productDetails?.productSellingModelOptions ?? [];
  const attributeCategories = productDetails?.attributeCategories ?? [];
  const childItems = productDetails?.childItems ?? [];

  return (
    <Dialog
      open={Boolean(productSummary)}
      onClose={onClose}
      fullWidth
      maxWidth="lg"
      PaperProps={{
        sx: (theme) => ({
          borderRadius: 3,
          border: "1px solid",
          borderColor: alpha(theme.palette.primary.main, 0.18),
          backgroundColor: alpha(theme.palette.background.paper, 0.98),
        }),
      }}
    >
      <DialogTitle sx={{ px: { xs: 2, sm: 2.5 }, py: { xs: 1.5, sm: 2 } }}>
        <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={1.25}>
          <Stack spacing={1} sx={{ pr: 1 }}>
            {isLoading ? (
              <Stack spacing={0.8}>
                <Skeleton variant="text" width={280} height={34} />
                <Stack direction="row" spacing={0.8}>
                  <Skeleton variant="rounded" width={96} height={24} />
                  <Skeleton variant="rounded" width={132} height={24} />
                </Stack>
              </Stack>
            ) : (
              <>
                <Typography variant="h6" sx={{ lineHeight: 1.35 }}>
                  {productDetails?.name ?? labels.detailsTitleFallback}
                </Typography>
                <Stack direction="row" spacing={0.8} useFlexGap flexWrap="wrap">
                  <Chip
                    size="small"
                    label={formatBooleanLabel(
                      productDetails?.isActive,
                      labels.activeLabel,
                      labels.inactiveLabel,
                      labels.notAvailableLabel
                    )}
                    icon={
                      productDetails?.isActive === true ? (
                        <CheckCircleRoundedIcon />
                      ) : productDetails?.isActive === false ? (
                        <CancelRoundedIcon />
                      ) : (
                        <HelpOutlineRoundedIcon />
                      )
                    }
                    color={productDetails?.isActive ? "success" : "default"}
                    variant="outlined"
                  />
                  <Chip
                    size="small"
                    label={productDetails?.productSpecificationTypeName ?? labels.notAvailableLabel}
                    variant="outlined"
                  />
                </Stack>
              </>
            )}
          </Stack>
          <IconButton onClick={onClose} aria-label={labels.closeDetailsAriaLabel}>
            <CloseOutlinedIcon />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent dividers sx={{ px: { xs: 2, sm: 2.5 }, py: { xs: 2, sm: 2.5 } }}>
        <Stack spacing={2.25}>
          {errorMessage ? (
            <Alert severity="warning" variant="outlined">
              {errorMessage}
            </Alert>
          ) : null}

          <Grid container spacing={2.25}>
            <Grid size={{ xs: 12, md: 5 }}>
              <Paper
                variant="outlined"
                sx={(theme) => ({
                  borderRadius: 2.5,
                  p: 1.5,
                  borderColor: alpha(theme.palette.divider, 0.9),
                })}
              >
                <Stack spacing={1.25}>
                  <Typography variant="subtitle2" color="text.secondary">
                    {labels.imageGalleryTitle}
                  </Typography>
                  <Box
                    sx={(theme) => ({
                      borderRadius: 2,
                      overflow: "hidden",
                      border: "1px solid",
                      borderColor: alpha(theme.palette.divider, 0.8),
                      background: `linear-gradient(150deg, ${alpha(theme.palette.primary.light, 0.12)} 0%, ${alpha(theme.palette.info.light, 0.12)} 48%, ${alpha(theme.palette.background.paper, 0.94)} 100%)`,
                      minHeight: { xs: 220, sm: 280 },
                    })}
                  >
                    {isLoading ? (
                      <Skeleton variant="rectangular" height="100%" sx={{ minHeight: { xs: 220, sm: 280 } }} />
                    ) : activeImageUrl ? (
                      <Box
                        component="img"
                        src={activeImageUrl}
                        alt={productDetails?.name ?? labels.detailsTitleFallback}
                        sx={{
                          width: "100%",
                          minHeight: { xs: 220, sm: 280 },
                          maxHeight: { xs: 280, sm: 330 },
                          objectFit: "contain",
                          objectPosition: "center",
                          display: "block",
                        }}
                      />
                    ) : (
                      <Stack alignItems="center" justifyContent="center" spacing={1.2} sx={{ minHeight: { xs: 220, sm: 280 } }}>
                        <Avatar sx={{ width: 56, height: 56, bgcolor: "primary.main" }}>
                          {productDetails ? toProductInitials(productDetails.name, labels.notAvailableLabel) : <ImageOutlinedIcon />}
                        </Avatar>
                        <Typography variant="body2" color="text.secondary">
                          {labels.notAvailableLabel}
                        </Typography>
                      </Stack>
                    )}
                  </Box>

                  <Stack direction="row" spacing={0.85} sx={{ overflowX: "auto", pb: 0.25 }}>
                    {thumbnailValues.map((thumbnailUrl, index) => {
                      const hasImage = thumbnailUrl.trim().length > 0;
                      const isSelected = hasImage && index === normalizedImageIndex;

                      return (
                        <ButtonBase
                          key={`${thumbnailUrl || "placeholder"}-${index}`}
                          aria-label={`${labels.imageThumbnailAriaLabel} ${index + 1}`}
                          onClick={() => {
                            if (hasImage) {
                              setSelectedImageUrl(thumbnailUrl);
                            }
                          }}
                          disabled={!hasImage}
                          sx={(theme) => ({
                            width: 68,
                            height: 68,
                            borderRadius: 1.5,
                            overflow: "hidden",
                            border: "2px solid",
                            borderColor: isSelected ? theme.palette.primary.main : alpha(theme.palette.divider, 0.8),
                            flexShrink: 0,
                            backgroundColor: alpha(theme.palette.background.default, 0.5),
                          })}
                        >
                          {hasImage ? (
                            <Box
                              component="img"
                              src={thumbnailUrl}
                              alt={`${productDetails?.name ?? labels.detailsTitleFallback} thumbnail ${index + 1}`}
                              sx={{ width: "100%", height: "100%", objectFit: "cover" }}
                            />
                          ) : isLoading ? (
                            <Skeleton variant="rectangular" width="100%" height="100%" />
                          ) : (
                            <Box
                              sx={{
                                width: "100%",
                                height: "100%",
                                display: "grid",
                                placeItems: "center",
                                color: "text.disabled",
                              }}
                            >
                              <ImageOutlinedIcon fontSize="small" />
                            </Box>
                          )}
                        </ButtonBase>
                      );
                    })}
                  </Stack>
                </Stack>
              </Paper>
            </Grid>

            <Grid size={{ xs: 12, md: 7 }}>
              <Paper
                variant="outlined"
                sx={(theme) => ({
                  borderRadius: 2.5,
                  p: { xs: 1.5, sm: 2 },
                  borderColor: alpha(theme.palette.divider, 0.9),
                })}
              >
                <Stack spacing={1.65}>
                  <Stack spacing={0.7}>
                    <Typography variant="subtitle1">{labels.descriptionTitle}</Typography>
                    {isLoading ? (
                      <Stack spacing={0.6}>
                        <Skeleton variant="text" width="100%" />
                        <Skeleton variant="text" width="94%" />
                        <Skeleton variant="text" width="72%" />
                      </Stack>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        {productDetails?.description?.trim() ? productDetails.description : labels.descriptionUnavailableLabel}
                      </Typography>
                    )}
                  </Stack>

                  <Divider />

                  <Grid container spacing={1.5}>
                    {isLoading ? (
                      <>
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <Skeleton variant="text" width="42%" />
                          <Skeleton variant="text" width="82%" />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <Skeleton variant="text" width="44%" />
                          <Skeleton variant="text" width="78%" />
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                          <Skeleton variant="text" width="26%" />
                          <Skeleton variant="text" width="66%" />
                        </Grid>
                      </>
                    ) : (
                      <>
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <Typography variant="caption" color="text.secondary">{labels.nodeTypeLabel}</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {toDisplayValue(productDetails?.nodeType, labels.notAvailableLabel)}
                          </Typography>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <Typography variant="caption" color="text.secondary">{labels.availabilityLabel}</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {formatAvailabilityDate(productDetails?.availabilityDate, labels.notAvailableLabel)}
                          </Typography>
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                          <Typography variant="caption" color="text.secondary">{labels.categoryLabel}</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {productDetails?.categories.length ? productDetails.categories.join(", ") : labels.notAvailableLabel}
                          </Typography>
                        </Grid>
                      </>
                    )}
                  </Grid>

                  <Divider />

                  <Stack spacing={1.1}>
                    <Typography variant="subtitle1">{labels.attributesTitle}</Typography>
                    {isLoading ? (
                      <Stack spacing={1}>
                        <Skeleton variant="rounded" height={54} />
                        <Skeleton variant="rounded" height={54} />
                      </Stack>
                    ) : attributeCategories.length > 0 ? (
                      <Stack spacing={1.1}>
                        {attributeCategories.map((category, categoryIndex) => (
                          <Paper
                            key={category.id ?? `${category.name ?? "category-inline"}-${categoryIndex}`}
                            variant="outlined"
                            sx={{ p: 1.2, borderRadius: 1.5 }}
                          >
                            <Stack spacing={0.9}>
                              <Typography variant="body2" sx={{ fontWeight: 700 }}>
                                {toDisplayValue(category.name, labels.notAvailableLabel)}
                              </Typography>
                              {category.attributes.length > 0 ? (
                                <Stack spacing={1}>
                                  {category.attributes.map((attribute, attributeIndex) => (
                                    <Paper key={`${attribute.label ?? "attribute-inline"}-${attributeIndex}`} variant="outlined" sx={{ p: 1.2, borderRadius: 1.5 }}>
                                      <Grid container spacing={1.25}>
                                        <Grid size={{ xs: 12, sm: 4 }}>
                                          <Typography variant="caption" color="text.secondary">{labels.attributeLabelLabel}</Typography>
                                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                            {toDisplayValue(attribute.label, labels.notAvailableLabel)}
                                          </Typography>
                                        </Grid>
                                        <Grid size={{ xs: 12, sm: 4 }}>
                                          <Typography variant="caption" color="text.secondary">{labels.defaultValueLabel}</Typography>
                                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                            {toDisplayValue(attribute.defaultValue, labels.notAvailableLabel)}
                                          </Typography>
                                        </Grid>
                                        <Grid size={{ xs: 12, sm: 4 }}>
                                          <Typography variant="caption" color="text.secondary">{labels.statusLabel}</Typography>
                                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                            {toDisplayValue(attribute.status, labels.notAvailableLabel)}
                                          </Typography>
                                        </Grid>
                                      </Grid>
                                    </Paper>
                                  ))}
                                </Stack>
                              ) : (
                                <Typography variant="body2" color="text.secondary">
                                  {labels.noAttributesMessage}
                                </Typography>
                              )}
                            </Stack>
                          </Paper>
                        ))}
                      </Stack>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        {labels.noAttributesMessage}
                      </Typography>
                    )}
                  </Stack>

                  {isLoading || childItems.length > 0 ? <Divider /> : null}

                  {isLoading || childItems.length > 0 ? (
                    <Stack spacing={1.1}>
                      {isLoading ? (
                      <>
                        <Typography variant="subtitle1">{labels.childItemsTitle}</Typography>
                        <Stack spacing={1}>
                          <Skeleton variant="rounded" height={42} />
                          <Skeleton variant="rounded" height={42} />
                        </Stack>
                      </>
                      ) : (
                      <Accordion
                        disableGutters
                        sx={{
                          border: "1px solid",
                          borderColor: "divider",
                          borderRadius: 1.5,
                          overflow: "hidden",
                          "&:before": { display: "none" },
                        }}
                      >
                        <AccordionSummary
                          expandIcon={<ExpandMoreOutlinedIcon />}
                          sx={{ px: 1.5, py: 0.25, minHeight: 50, "& .MuiAccordionSummary-content": { my: 0.5 } }}
                        >
                          <Stack
                            direction="row"
                            alignItems="center"
                            justifyContent="space-between"
                            spacing={1}
                            sx={{ width: "100%" }}
                          >
                            <Typography variant="subtitle1">{labels.childItemsTitle}</Typography>
                            <Typography variant="body2" color="text.secondary">
                              {childItems.length}
                            </Typography>
                          </Stack>
                        </AccordionSummary>
                        <AccordionDetails sx={{ px: 1, pb: 1.25, pt: 0 }}>
                          <Stack spacing={1} sx={{ maxHeight: 280, overflowY: "auto", pr: 0.5 }}>
                            {childItems.map((item, index) => {
                              const itemKey = item.id ?? `child-item-${index}`;
                              const hasChildren = item.children.length > 0;

                              const rowHeader = (
                                <Stack
                                  direction="row"
                                  alignItems="center"
                                  justifyContent="space-between"
                                  spacing={1}
                                  sx={{ py: 0.25, width: "100%" }}
                                >
                                  <Stack spacing={0.2} sx={{ minWidth: 0 }}>
                                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                      {item.name}
                                    </Typography>
                                    {item.description?.trim() ? (
                                      <Typography
                                        variant="caption"
                                        color="text.secondary"
                                        sx={{
                                          display: "-webkit-box",
                                          overflow: "hidden",
                                          WebkitLineClamp: 1,
                                          WebkitBoxOrient: "vertical",
                                        }}
                                      >
                                        {item.description}
                                      </Typography>
                                    ) : null}
                                  </Stack>
                                  <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: "nowrap" }}>
                                    {labels.childItemsQuantityLabel}: {item.quantity ?? labels.notAvailableLabel}
                                  </Typography>
                                </Stack>
                              );

                              if (!hasChildren) {
                                return (
                                  <Paper key={itemKey} variant="outlined" sx={{ borderRadius: 1.5, px: 1.5, py: 1 }}>
                                    {rowHeader}
                                  </Paper>
                                );
                              }

                              const renderNestedChildren = (
                                items: ProductDetails["childItems"],
                                depth: number,
                                path: string
                              ): ReactNode => (
                                <Stack spacing={1} sx={{ pl: depth * CHILD_INDENT_UNIT }}>
                                  {items.map((nestedItem, nestedIndex) => {
                                    const nestedKey = nestedItem.id ?? `${path}-${nestedIndex}`;
                                    const nestedHasChildren = nestedItem.children.length > 0;

                                    const nestedHeader = (
                                      <Stack
                                        direction="row"
                                        alignItems="center"
                                        justifyContent="space-between"
                                        spacing={1}
                                        sx={{ py: 0.25, width: "100%" }}
                                      >
                                        <Stack spacing={0.2} sx={{ minWidth: 0 }}>
                                          <Typography variant="body2" sx={{ fontWeight: depth > 1 ? 500 : 600 }}>
                                            {nestedItem.name}
                                          </Typography>
                                          {nestedItem.description?.trim() ? (
                                            <Typography
                                              variant="caption"
                                              color="text.secondary"
                                              sx={{
                                                display: "-webkit-box",
                                                overflow: "hidden",
                                                WebkitLineClamp: 1,
                                                WebkitBoxOrient: "vertical",
                                              }}
                                            >
                                              {nestedItem.description}
                                            </Typography>
                                          ) : null}
                                        </Stack>
                                        <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: "nowrap" }}>
                                          {labels.childItemsQuantityLabel}: {nestedItem.quantity ?? labels.notAvailableLabel}
                                        </Typography>
                                      </Stack>
                                    );

                                    if (!nestedHasChildren) {
                                      return (
                                        <Paper
                                          key={nestedKey}
                                          variant="outlined"
                                          sx={{ borderRadius: 1.5, px: 1.5, py: 1 }}
                                        >
                                          {nestedHeader}
                                        </Paper>
                                      );
                                    }

                                    return (
                                      <Accordion
                                        key={nestedKey}
                                        disableGutters
                                        sx={{
                                          border: "1px solid",
                                          borderColor: "divider",
                                          borderRadius: 1.5,
                                          overflow: "hidden",
                                          "&:before": { display: "none" },
                                        }}
                                      >
                                        <AccordionSummary
                                          expandIcon={<ExpandMoreOutlinedIcon />}
                                          sx={{ px: 1.5, py: 0.25, minHeight: 46, "& .MuiAccordionSummary-content": { my: 0.5 } }}
                                        >
                                          {nestedHeader}
                                        </AccordionSummary>
                                        <AccordionDetails sx={{ px: 1, pb: 1.25, pt: 0 }}>
                                          {renderNestedChildren(nestedItem.children, depth + 1, `${nestedKey}-child`)}
                                        </AccordionDetails>
                                      </Accordion>
                                    );
                                  })}
                                </Stack>
                              );

                              return (
                                <Accordion
                                  key={itemKey}
                                  disableGutters
                                  sx={{
                                    border: "1px solid",
                                    borderColor: "divider",
                                    borderRadius: 1.5,
                                    overflow: "hidden",
                                    "&:before": { display: "none" },
                                  }}
                                >
                                  <AccordionSummary
                                    expandIcon={<ExpandMoreOutlinedIcon />}
                                    sx={{ px: 1.5, py: 0.25, minHeight: 50, "& .MuiAccordionSummary-content": { my: 0.5 } }}
                                  >
                                    {rowHeader}
                                  </AccordionSummary>
                                  <AccordionDetails sx={{ px: 1, pb: 1.25, pt: 0 }}>
                                    {renderNestedChildren(item.children, 1, `${itemKey}-child`)}
                                  </AccordionDetails>
                                </Accordion>
                              );
                            })}
                          </Stack>
                        </AccordionDetails>
                      </Accordion>
                      )}
                    </Stack>
                  ) : null}
                </Stack>
              </Paper>
            </Grid>
          </Grid>

          <Stack spacing={1.25}>
            <Typography variant="subtitle1">{labels.sellingModelsTitle}</Typography>
            {isLoading ? (
              <Stack spacing={1}>
                <Skeleton variant="rounded" height={54} />
                <Skeleton variant="rounded" height={54} />
              </Stack>
            ) : sellingModelOptions.length > 0 ? (
              <Stack spacing={1.2}>
                {sellingModelOptions.map((option, optionIndex) => (
                  <Accordion
                    key={option.id ?? `${productDetails?.id ?? "product"}-${optionIndex}`}
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
