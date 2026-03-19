import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import ChevronLeftRoundedIcon from "@mui/icons-material/ChevronLeftRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import FiberManualRecordRoundedIcon from "@mui/icons-material/FiberManualRecordRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";
import TipsAndUpdatesRoundedIcon from "@mui/icons-material/TipsAndUpdatesRounded";
import {
  Alert,
  Box,
  Button,
  Chip,
  Grid,
  IconButton,
  LinearProgress,
  Paper,
  Skeleton,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { keyframes } from "@mui/system";
import { useEffect, useMemo, useState } from "react";
import { PRODUCT_COPY } from "../../constants/productContent";
import type {
  DashboardAsset,
  DashboardInsight,
  DashboardOrder,
  DashboardQuote,
  DashboardSummary,
} from "../../services/salesforceApi";
import { formatCurrency, formatEta, mapStatusColor } from "./formatters";

const ETA_TEXT_COLOR = "#0F4C81";
const dashboardCopy = PRODUCT_COPY.dashboard;
const insightsBorderSpark = keyframes`
  to {
    transform: rotate(1turn);
  }
`;
const chartGrow = keyframes`
  from {
    transform: scaleY(0);
    opacity: 0.65;
  }
  to {
    transform: scaleY(1);
    opacity: 1;
  }
`;

function OrderStatusDistributionChart({
  orderHealth,
}: {
  orderHealth: { inProgressCount: number; activeCount: number; pastCount: number };
}) {
  const rows = [
    { label: "In Progress", count: orderHealth.inProgressCount, color: "primary.main" },
    { label: "Active", count: orderHealth.activeCount, color: "success.main" },
    { label: "Past", count: orderHealth.pastCount, color: "text.secondary" },
  ] as const;

  const total = rows.reduce((sum, row) => sum + row.count, 0);

  return (
    <Stack spacing={1.1}>
      <Typography variant="subtitle2">Order Status Distribution</Typography>
      <Box sx={{ height: 168, px: 1, pt: 1 }}>
        <Stack direction="row" spacing={1.2} sx={{ height: "100%" }} alignItems="flex-end">
          {rows.map((row, index) => {
            const percentage = total > 0 ? Math.round((row.count / total) * 100) : 0;
            const barHeight = total > 0 ? Math.max(10, percentage) : 0;

            return (
              <Stack key={row.label} sx={{ flex: 1, minWidth: 0, height: "100%" }} spacing={0.65} alignItems="center">
                <Typography variant="caption" color="text.secondary">
                  {row.count}
                </Typography>
                <Box
                  sx={{
                    width: "65%",
                    height: "100%",
                    borderRadius: 1.5,
                    bgcolor: "action.hover",
                    display: "flex",
                    alignItems: "flex-end",
                    p: 0.45,
                    mx: "auto",
                  }}
                >
                  <Box
                    sx={{
                      width: "100%",
                      height: `${barHeight}%`,
                      borderRadius: 1.2,
                      bgcolor: row.color,
                      transformOrigin: "bottom center",
                      animation: `${chartGrow} 700ms ease-out ${index * 90}ms both`,
                    }}
                  />
                </Box>
                <Typography variant="caption" color="text.secondary" textAlign="center">
                  {row.label}
                </Typography>
              </Stack>
            );
          })}
        </Stack>
      </Box>
      {total === 0 ? (
        <Typography variant="caption" color="text.secondary">
          No order data available.
        </Typography>
      ) : null}
    </Stack>
  );
}

function KpiCard({ title, value, helper }: { title: string; value: string; helper: string }) {
  return (
    <Paper variant="outlined" sx={{ borderRadius: 2, p: 2, height: "100%" }}>
      <Stack spacing={0.4}>
        <Typography color="text.secondary" variant="caption">
          {title}
        </Typography>
        <Typography variant="h4">{value}</Typography>
        <Typography color="text.secondary" variant="body2">
          {helper}
        </Typography>
      </Stack>
    </Paper>
  );
}

function normalizeText(value: string | null | undefined): string {
  return value?.trim().toLowerCase() ?? "";
}

function isDelayedOrder(order: DashboardOrder): boolean {
  return normalizeText(order.fulfillment?.state).includes("delay");
}

function isCompletedStatus(order: DashboardOrder): boolean {
  const normalized = normalizeText(order.status ?? order.fulfillment?.state);
  return (
    normalized.includes("activat")
    || normalized.includes("complet")
    || normalized.includes("accept")
    || normalized.includes("install")
  );
}

function toProgressValue(value: number | null): number {
  if (value === null) {
    return 0;
  }

  return Math.max(0, Math.min(100, Math.round(value)));
}

function formatInsightPriority(priority: string | null): string {
  if (!priority) {
    return dashboardCopy.insightPriorityFallbackLabel;
  }

  return priority.charAt(0).toUpperCase() + priority.slice(1).toLowerCase();
}

function formatInsightType(type: string | null): string {
  if (!type) {
    return dashboardCopy.insightTypeFallbackLabel;
  }

  return type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();
}

function mapInsightPriorityColor(priority: string | null): "success" | "info" | "warning" | "error" | "default" {
  const normalized = normalizeText(priority);
  if (normalized.includes("low")) {
    return "success";
  }
  if (normalized.includes("medium")) {
    return "warning";
  }
  if (normalized.includes("high") || normalized.includes("critical")) {
    return "error";
  }
  return "info";
}

function getInsightTypeIcon(type: string | null) {
  const normalized = normalizeText(type);
  if (normalized.includes("trend")) {
    return <TrendingUpRoundedIcon sx={{ fontSize: 16 }} />;
  }

  return <TipsAndUpdatesRoundedIcon sx={{ fontSize: 16 }} />;
}

type DashboardCarouselSlide = {
  id: "quotes" | "assets";
  title: string;
  emptyLabel: string;
  totalCount: number;
  entries: Array<{
    id: string;
    primary: string;
    secondary: string;
    status: string | null;
  }>;
};

type ActivationHighlight = {
  order: DashboardOrder;
  isAtRisk: boolean;
  progressPercent: number | null;
};

function QuotesAssetsCarousel({
  quotesTotal,
  assetsTotal,
  quotesPreview,
  assetsPreview,
}: {
  quotesTotal: number;
  assetsTotal: number;
  quotesPreview: DashboardQuote[];
  assetsPreview: DashboardAsset[];
}) {
  const slides = useMemo<DashboardCarouselSlide[]>(
    () => [
      {
        id: "quotes",
        title: "Quotes",
        emptyLabel: "No quotes available.",
        totalCount: quotesTotal,
        entries: quotesPreview.map((quote) => ({
          id: quote.quoteId,
          primary: quote.name ?? quote.quoteId,
          secondary: formatCurrency(quote.totalAmount),
          status: quote.status,
        })),
      },
      {
        id: "assets",
        title: "Assets",
        emptyLabel: "No assets available.",
        totalCount: assetsTotal,
        entries: assetsPreview.map((asset) => ({
          id: asset.assetId,
          primary: asset.name ?? asset.assetId,
          secondary: asset.productFamily ?? "Not available",
          status: asset.status,
        })),
      },
    ],
    [assetsPreview, assetsTotal, quotesPreview, quotesTotal]
  );

  const [activeIndex, setActiveIndex] = useState(0);
  const hasMultipleSlides = slides.length > 1;

  useEffect(() => {
    if (!hasMultipleSlides) {
      return;
    }

    const timer = window.setInterval(() => {
      setActiveIndex((previous) => (previous + 1) % slides.length);
    }, 5_000);

    return () => {
      window.clearInterval(timer);
    };
  }, [hasMultipleSlides, slides.length]);

  const normalizedActiveIndex = activeIndex % slides.length;

  const goNext = () => {
    setActiveIndex((previous) => (previous + 1) % slides.length);
  };

  const goPrevious = () => {
    setActiveIndex((previous) => (previous - 1 + slides.length) % slides.length);
  };

  return (
    <Paper
      variant="outlined"
      sx={(theme) => ({
        borderRadius: 2,
        p: 2,
        background: `radial-gradient(860px 240px at 88% 0%, ${alpha(theme.palette.info.main, 0.13)} 0%, ${alpha(theme.palette.background.paper, 0.94)} 62%), radial-gradient(760px 220px at 12% 100%, ${alpha(theme.palette.primary.main, 0.11)} 0%, ${alpha(theme.palette.background.paper, 0.95)} 64%)`,
      })}
    >
      <Stack spacing={1.2}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Quotes & Assets</Typography>

          <Stack direction="row" spacing={0.5}>
            <IconButton
              onClick={goPrevious}
              disabled={!hasMultipleSlides}
              color="primary"
              size="small"
              aria-label="Previous slide"
              sx={{ border: 1, borderColor: "divider", bgcolor: "background.paper" }}
            >
              <ChevronLeftRoundedIcon fontSize="small" />
            </IconButton>
            <IconButton
              onClick={goNext}
              disabled={!hasMultipleSlides}
              color="primary"
              size="small"
              aria-label="Next slide"
              sx={{ border: 1, borderColor: "divider", bgcolor: "background.paper" }}
            >
              <ChevronRightRoundedIcon fontSize="small" />
            </IconButton>
          </Stack>
        </Stack>

        <Box sx={{ position: "relative", minHeight: 186, overflow: "hidden", borderRadius: 1.75 }}>
          {slides.map((slide, index) => {
            const isActive = index === normalizedActiveIndex;
            const isBeforeActive = index < normalizedActiveIndex;
            return (
              <Paper
                key={slide.id}
                variant="outlined"
                sx={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: 1.75,
                  p: 1.2,
                  overflow: "hidden",
                  transition: "transform 520ms cubic-bezier(0.22, 0.61, 0.36, 1), opacity 460ms ease, filter 460ms ease",
                  transform: isActive
                    ? "translate3d(0, 0, 0) scale(1) rotateY(0deg)"
                    : isBeforeActive
                      ? "translate3d(-22px, 0, 0) scale(0.985) rotateY(7deg)"
                      : "translate3d(22px, 0, 0) scale(0.985) rotateY(-7deg)",
                  opacity: isActive ? 1 : 0,
                  filter: isActive ? "none" : "blur(2px)",
                  zIndex: isActive ? 2 : 1,
                  pointerEvents: isActive ? "auto" : "none",
                }}
              >
                <Stack spacing={1}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="subtitle2">{slide.title}</Typography>
                    <Stack direction="row" spacing={0.6} alignItems="center">
                      {slide.totalCount > slide.entries.length ? (
                        <Chip
                          size="small"
                          color="primary"
                          variant="outlined"
                          label={`+${slide.totalCount - slide.entries.length} more`}
                        />
                      ) : null}
                      <Chip size="small" variant="outlined" label={`${index + 1}/${slides.length}`} />
                    </Stack>
                  </Stack>

                  {slide.entries.length === 0 ? (
                    <Typography color="text.secondary" variant="body2">
                      {slide.emptyLabel}
                    </Typography>
                  ) : (
                    slide.entries.map((entry) => (
                      <Paper key={entry.id} variant="outlined" sx={{ borderRadius: 1.5, p: 1 }}>
                        <Stack direction="row" justifyContent="space-between" spacing={1}>
                          <Stack>
                            <Typography variant="body2" fontWeight={700}>
                              {entry.primary}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {entry.secondary}
                            </Typography>
                          </Stack>
                          <Chip
                            color={mapStatusColor(entry.status)}
                            label={entry.status ?? "Not available"}
                            size="small"
                            variant="outlined"
                          />
                        </Stack>
                      </Paper>
                    ))
                  )}
                </Stack>
              </Paper>
            );
          })}
        </Box>

        <Stack direction="row" spacing={0.7} justifyContent="center">
          {slides.map((slide, index) => (
            <Box
              key={slide.id}
              component="button"
              type="button"
              onClick={() => setActiveIndex(index)}
              aria-label={`Go to ${slide.title} slide`}
              sx={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                border: 0,
                p: 0,
                bgcolor: index === normalizedActiveIndex ? "primary.main" : "action.disabled",
                cursor: "pointer",
              }}
            />
          ))}
        </Stack>
      </Stack>
    </Paper>
  );
}

export function DashboardHeaderActions({
  fetchedAtLabel,
  isRefreshing,
  disableRefresh,
  showCreateQuote,
  isCreatingQuote,
  disableCreateQuote,
  onCreateQuote,
  onRefresh,
}: {
  fetchedAtLabel: string;
  isRefreshing: boolean;
  disableRefresh: boolean;
  showCreateQuote: boolean;
  isCreatingQuote: boolean;
  disableCreateQuote: boolean;
  onCreateQuote: () => Promise<void>;
  onRefresh: () => Promise<void>;
}) {
  return (
    <>
      <Paper
        variant="outlined"
        sx={(theme) => ({
          borderRadius: 3,
          p: { xs: 2.25, md: 2.75 },
          background: `radial-gradient(1000px 360px at 8% 0%, ${alpha(theme.palette.primary.main, 0.16)} 0%, ${alpha(theme.palette.background.paper, 0.82)} 58%), radial-gradient(840px 260px at 100% 100%, ${alpha(theme.palette.warning.main, 0.13)} 0%, ${alpha(theme.palette.background.paper, 0.88)} 62%)`,
        })}
      >
        <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2}>
          <Stack spacing={0.8}>
            <Typography variant="h4">{dashboardCopy.title}</Typography>
            <Typography color="text.secondary" variant="body2">
              {dashboardCopy.subtitle}
            </Typography>
            <Typography color="text.secondary" variant="caption">
              {dashboardCopy.lastUpdatedLabel}: {fetchedAtLabel}
            </Typography>
          </Stack>

          <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
            {showCreateQuote ? (
              <Button
                variant="contained"
                color="primary"
                size="small"
                disableElevation
                onClick={onCreateQuote}
                disabled={isCreatingQuote || disableCreateQuote}
                sx={{
                  height: 34,
                  minWidth: 0,
                  px: 1.25,
                  borderRadius: 2,
                  textTransform: "none",
                  whiteSpace: "nowrap",
                }}
              >
                {isCreatingQuote ? dashboardCopy.creatingQuoteLabel : dashboardCopy.createQuoteLabel}
              </Button>
            ) : null}
            <Tooltip title={dashboardCopy.refreshTooltipLabel}>
              <span>
                <IconButton
                  onClick={onRefresh}
                  disabled={isRefreshing || disableRefresh}
                  color="primary"
                  size="small"
                  sx={{
                    width: 34,
                    height: 34,
                    border: 1,
                    borderColor: "divider",
                    bgcolor: "background.paper",
                  }}
                >
                  <RefreshRoundedIcon fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
          </Stack>
        </Stack>
      </Paper>

      {isRefreshing ? <LinearProgress sx={{ borderRadius: 999 }} /> : null}
    </>
  );
}

export function DashboardError({ errorMessage, hideOnData }: { errorMessage: string | null; hideOnData: boolean }) {
  if (!errorMessage || hideOnData) {
    return null;
  }

  return <Alert severity="error">{errorMessage}</Alert>;
}

export function DashboardKpiStrip({
  isLoading,
  kpis,
  orderHealth,
}: {
  isLoading: boolean;
  kpis: DashboardSummary | null;
  orderHealth: { inProgressCount: number; activeCount: number; pastCount: number };
}) {
  return (
    <Grid container spacing={1.5}>
      {isLoading
        ? Array.from({ length: 3 }).map((_, index) => (
            <Grid key={index} size={{ xs: 12, sm: 6, lg: 4 }}>
              <Paper variant="outlined" sx={{ borderRadius: 2, p: 2 }}>
                <Stack spacing={1}>
                  <Skeleton variant="text" width="45%" />
                  <Skeleton variant="text" width="35%" height={46} />
                  <Skeleton variant="text" width="60%" />
                </Stack>
              </Paper>
            </Grid>
          ))
        : (
          <>
            <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
              <KpiCard
                title="Active Orders"
                value={`${kpis?.activeOrders ?? 0}`}
                helper={`${orderHealth.inProgressCount} in progress`}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
              <KpiCard title="Total Quotes" value={`${kpis?.totalQuotes ?? 0}`} helper="Quotes from dashboard API" />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
              <KpiCard title="Total Assets" value={`${kpis?.totalAssets ?? 0}`} helper="Assets tied to account" />
            </Grid>
          </>
          )}
    </Grid>
  );
}

export function DashboardContent({
  orderHealth,
  activationHighlights,
  insights,
  quotesTotal,
  assetsTotal,
  quotesPreview,
  assetsPreview,
}: {
  orderHealth: { inProgressCount: number; activeCount: number; pastCount: number };
  activationHighlights: ActivationHighlight[];
  insights: DashboardInsight[];
  quotesTotal: number;
  assetsTotal: number;
  quotesPreview: DashboardQuote[];
  assetsPreview: DashboardAsset[];
}) {
  return (
    <Grid container spacing={1.5}>
      <Grid size={{ xs: 12, lg: 7 }}>
        <Stack spacing={1.5}>
          <Paper
            variant="outlined"
            sx={(theme) => ({
              borderRadius: 2,
              p: 2,
              background: `radial-gradient(780px 250px at 8% 0%, ${alpha(theme.palette.primary.main, 0.16)} 0%, ${alpha(theme.palette.background.paper, 0.92)} 56%), radial-gradient(620px 200px at 100% 100%, ${alpha(theme.palette.warning.main, 0.12)} 0%, ${alpha(theme.palette.background.paper, 0.96)} 62%)`,
            })}
          >
            <Stack spacing={1.3}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="h6">Order Health</Typography>
                <Chip size="small" label="Live" variant="outlined" />
              </Stack>
              <OrderStatusDistributionChart orderHealth={orderHealth} />
            </Stack>
          </Paper>

          <Paper variant="outlined" sx={{ borderRadius: 2, p: 2 }}>
            <Stack spacing={1.2}>
              <Typography variant="h6">{dashboardCopy.milestonesTitle}</Typography>
              {activationHighlights.length === 0 ? (
                <Typography color="text.secondary" variant="body2">
                  {dashboardCopy.milestonesEmptyMessage}
                </Typography>
              ) : (
                activationHighlights.map((highlight) => (
                  <Paper key={highlight.order.orderId} variant="outlined" sx={{ borderRadius: 1.75, p: 1.2 }}>
                    <Stack spacing={1.1}>
                      <Stack direction="row" justifyContent="space-between" spacing={1} alignItems="center">
                        <Typography variant="body2" fontWeight={700}>
                          {highlight.order.name ?? highlight.order.orderId}
                        </Typography>
                        <Stack direction="row" spacing={0.5} alignItems="center" sx={{ flexShrink: 0, minWidth: 0 }}>
                          {highlight.isAtRisk ? (
                            <Tooltip title={dashboardCopy.milestoneAtRiskLabel}>
                              <FiberManualRecordRoundedIcon
                                aria-label={dashboardCopy.milestoneAtRiskLabel}
                                sx={{ fontSize: 12, display: "block", color: "error.main" }}
                              />
                            </Tooltip>
                          ) : null}
                          {isDelayedOrder(highlight.order) ? (
                            <Tooltip title={dashboardCopy.milestoneDelayedLabel}>
                              <FiberManualRecordRoundedIcon
                                aria-label={dashboardCopy.milestoneDelayedLabel}
                                sx={{ fontSize: 12, display: "block", color: "warning.main" }}
                              />
                            </Tooltip>
                          ) : null}
                          <Tooltip
                            title={
                              highlight.order.status
                              ?? highlight.order.fulfillment?.state
                              ?? dashboardCopy.milestoneStatusFallbackLabel
                            }
                          >
                            {isCompletedStatus(highlight.order) ? (
                              <CheckCircleRoundedIcon
                                aria-label={dashboardCopy.milestoneStatusFallbackLabel}
                                sx={{ fontSize: 18, display: "block", color: "success.main" }}
                              />
                            ) : (
                              <FiberManualRecordRoundedIcon
                                aria-label={dashboardCopy.milestoneStatusFallbackLabel}
                                sx={{
                                  fontSize: 12,
                                  display: "block",
                                  color: mapStatusColor(highlight.order.status ?? highlight.order.fulfillment?.state ?? null) === "warning"
                                    ? "warning.main"
                                    : mapStatusColor(highlight.order.status ?? highlight.order.fulfillment?.state ?? null) === "info"
                                      ? "info.main"
                                      : mapStatusColor(highlight.order.status ?? highlight.order.fulfillment?.state ?? null) === "success"
                                        ? "success.main"
                                        : "text.disabled",
                                }}
                              />
                            )}
                          </Tooltip>
                        </Stack>
                      </Stack>

                      <Stack direction={{ xs: "column", sm: "row" }} spacing={1.1} alignItems={{ sm: "center" }}>
                        <Typography variant="caption" sx={{ color: ETA_TEXT_COLOR, fontWeight: 600 }}>
                          {dashboardCopy.milestoneEtaLabel}:{" "}
                          {formatEta(highlight.order.hoursRemaining, highlight.order.minutesRemaining)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {dashboardCopy.milestoneProgressLabel}: {toProgressValue(highlight.progressPercent)}%
                        </Typography>
                      </Stack>

                      <LinearProgress
                        variant="determinate"
                        value={toProgressValue(highlight.progressPercent)}
                        sx={{ height: 6, borderRadius: 999 }}
                      />

                      <Typography variant="caption" color="text.secondary">
                        {dashboardCopy.milestoneSummaryLabel}:{" "}
                        {highlight.order.fulfillment?.completedSteps ?? 0}/{highlight.order.fulfillment?.totalSteps ?? 0}
                        {" • "}
                        {dashboardCopy.milestoneInProgressLabel}: {highlight.order.fulfillment?.inProgressSteps ?? 0}
                        {" • "}
                        {dashboardCopy.milestoneFailedLabel}: {highlight.order.fulfillment?.failedSteps ?? 0}
                        {" • "}
                        {dashboardCopy.milestonePlanAgeLabel}:{" "}
                        {highlight.order.fulfillment?.planAgeHours ?? dashboardCopy.milestonePlanAgeFallback}
                      </Typography>
                    </Stack>
                  </Paper>
                ))
              )}
            </Stack>
          </Paper>
        </Stack>
      </Grid>

      <Grid size={{ xs: 12, lg: 5 }}>
        <Stack spacing={1.5}>
          <QuotesAssetsCarousel
            quotesTotal={quotesTotal}
            assetsTotal={assetsTotal}
            quotesPreview={quotesPreview}
            assetsPreview={assetsPreview}
          />

          <Paper
            variant="outlined"
            sx={(theme) => ({
              position: "relative",
              borderRadius: 2,
              p: 2,
              overflow: "hidden",
              border: "1px solid transparent",
              "&::before": {
                content: '""',
                position: "absolute",
                width: "220%",
                height: "220%",
                left: "-60%",
                top: "-60%",
                borderRadius: "inherit",
                background: `conic-gradient(from 0deg, transparent 0deg, transparent 292deg, ${alpha(theme.palette.info.main, 0.85)} 330deg, transparent 360deg)`,
                animation: `${insightsBorderSpark} 3.2s linear infinite`,
                pointerEvents: "none",
              },
              "&::after": {
                content: '""',
                position: "absolute",
                inset: 1,
                borderRadius: "inherit",
                bgcolor: theme.palette.background.paper,
                pointerEvents: "none",
              },
            })}
          >
            <Stack spacing={1.2} sx={{ position: "relative", zIndex: 2 }}>
              <Typography variant="h6">{dashboardCopy.aiInsightsTitle}</Typography>
              {insights.length === 0 ? (
                <Typography color="text.secondary" variant="body2">
                  {dashboardCopy.aiInsightsEmptyMessage}
                </Typography>
              ) : (
                insights.slice(0, 3).map((insight, index) => (
                  <Paper
                    key={`${insight.type ?? "insight"}-${index}`}
                    variant="outlined"
                    sx={(theme) => ({
                      borderRadius: 1.5,
                      p: 1.1,
                      bgcolor: "background.paper",
                      borderColor: alpha(theme.palette.info.main, 0.22),
                    })}
                  >
                    <Stack spacing={0.75}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1}>
                        <Chip
                          icon={getInsightTypeIcon(insight.type)}
                          label={formatInsightType(insight.type)}
                          size="small"
                          variant="outlined"
                          sx={{
                            height: 22,
                            "& .MuiChip-label": { px: 0.75, fontSize: "0.72rem", fontWeight: 600 },
                          }}
                        />
                        <Chip
                          size="small"
                          color={mapInsightPriorityColor(insight.priority)}
                          label={`${formatInsightPriority(insight.priority)} priority`}
                          variant="filled"
                          sx={{ height: 22, fontWeight: 600 }}
                        />
                      </Stack>
                      <Typography variant="body2" fontWeight={600}>
                        {insight.message ?? dashboardCopy.aiInsightMessageFallback}
                      </Typography>
                    </Stack>
                  </Paper>
                ))
              )}
            </Stack>
          </Paper>
        </Stack>
      </Grid>
    </Grid>
  );
}
