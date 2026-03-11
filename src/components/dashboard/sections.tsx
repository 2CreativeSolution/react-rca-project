import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import {
  Alert,
  Box,
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
import type { DashboardAsset, DashboardInsight, DashboardOrder, DashboardQuote, DashboardSummary } from "../../services/salesforceApi";
import { formatCurrency, formatEta, mapStatusColor } from "./formatters";

const ETA_TEXT_COLOR = "#0F4C81";
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

export function DashboardHeaderActions({
  fetchedAtLabel,
  isRefreshing,
  disableRefresh,
  onRefresh,
}: {
  fetchedAtLabel: string;
  isRefreshing: boolean;
  disableRefresh: boolean;
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
            <Typography variant="h4">Executive Dashboard</Typography>
            <Typography color="text.secondary" variant="body2">
              High-level health across orders, quotes, assets, and account momentum.
            </Typography>
            <Typography color="text.secondary" variant="caption">
              Last updated: {fetchedAtLabel}
            </Typography>
          </Stack>

          <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
            <Tooltip title="Refresh">
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
        ? Array.from({ length: 4 }).map((_, index) => (
            <Grid key={index} size={{ xs: 12, sm: 6, lg: 3 }}>
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
            <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
              <KpiCard
                title="Active Orders"
                value={`${kpis?.activeOrders ?? 0}`}
                helper={`${orderHealth.inProgressCount} in progress`}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
              <KpiCard title="Total Quotes" value={`${kpis?.totalQuotes ?? 0}`} helper="Quotes from dashboard API" />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
              <KpiCard title="Total Assets" value={`${kpis?.totalAssets ?? 0}`} helper="Assets tied to account" />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
              <KpiCard title="Revenue" value={formatCurrency(kpis?.totalRevenue ?? null)} helper="Reported cumulative revenue" />
            </Grid>
          </>
          )}
    </Grid>
  );
}

export function DashboardContent({
  orderHealth,
  activationHighlights,
  quotesPreview,
  assetsPreview,
  insights,
}: {
  orderHealth: { inProgressCount: number; activeCount: number; pastCount: number };
  activationHighlights: DashboardOrder[];
  quotesPreview: DashboardQuote[];
  assetsPreview: DashboardAsset[];
  insights: DashboardInsight[];
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
              <Typography variant="h6">Upcoming Activation Milestones</Typography>
              {activationHighlights.length === 0 ? (
                <Typography color="text.secondary" variant="body2">No activation milestones are available.</Typography>
              ) : (
                activationHighlights.map((order) => (
                  <Paper key={order.orderId} variant="outlined" sx={{ borderRadius: 1.75, p: 1.2 }}>
                    <Stack direction="row" justifyContent="space-between" spacing={1}>
                      <Stack spacing={0.25}>
                        <Typography variant="body2" fontWeight={700}>{order.orderId}</Typography>
                        <Typography
                          variant="caption"
                          sx={{ color: ETA_TEXT_COLOR, fontWeight: 600 }}
                        >
                          ETA: {formatEta(order.hoursRemaining, order.minutesRemaining)}
                        </Typography>
                      </Stack>
                      <Chip
                        color={mapStatusColor(order.fulfillment?.state ?? order.status)}
                        label={order.fulfillment?.state ?? order.status ?? "Not available"}
                        size="small"
                        variant="outlined"
                      />
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
          <Paper variant="outlined" sx={{ borderRadius: 2, p: 2 }}>
            <Stack spacing={1.2}>
              <Typography variant="h6">Quotes</Typography>
              {quotesPreview.length === 0 ? (
                <Typography color="text.secondary" variant="body2">No quotes available.</Typography>
              ) : (
                quotesPreview.map((quote) => (
                  <Paper key={quote.quoteId} variant="outlined" sx={{ borderRadius: 1.75, p: 1.2 }}>
                    <Stack direction="row" justifyContent="space-between" spacing={1}>
                      <Stack>
                        <Typography variant="body2" fontWeight={700}>{quote.name ?? quote.quoteId}</Typography>
                        <Typography variant="caption" color="text.secondary">{formatCurrency(quote.totalAmount)}</Typography>
                      </Stack>
                      <Chip
                        color={mapStatusColor(quote.status)}
                        label={quote.status ?? "Not available"}
                        size="small"
                        variant="outlined"
                      />
                    </Stack>
                  </Paper>
                ))
              )}
            </Stack>
          </Paper>

          <Paper variant="outlined" sx={{ borderRadius: 2, p: 2 }}>
            <Stack spacing={1.2}>
              <Typography variant="h6">Assets</Typography>
              {assetsPreview.length === 0 ? (
                <Typography color="text.secondary" variant="body2">No assets available.</Typography>
              ) : (
                assetsPreview.map((asset) => (
                  <Paper key={asset.assetId} variant="outlined" sx={{ borderRadius: 1.75, p: 1.2 }}>
                    <Stack direction="row" justifyContent="space-between" spacing={1}>
                      <Stack>
                        <Typography variant="body2" fontWeight={700}>{asset.name ?? asset.assetId}</Typography>
                        <Typography variant="caption" color="text.secondary">{asset.productFamily ?? "Not available"}</Typography>
                      </Stack>
                      <Chip
                        color={mapStatusColor(asset.status)}
                        label={asset.status ?? "Not available"}
                        size="small"
                        variant="outlined"
                      />
                    </Stack>
                  </Paper>
                ))
              )}
            </Stack>
          </Paper>

          <Paper variant="outlined" sx={{ borderRadius: 2, p: 2 }}>
            <Stack spacing={1.2}>
              <Typography variant="h6">AI Insights</Typography>
              {insights.length === 0 ? (
                <Typography color="text.secondary" variant="body2">
                  No insights available yet.
                </Typography>
              ) : (
                <Typography color="text.secondary" variant="body2">
                  {`${insights.length} insights available.`}
                </Typography>
              )}
            </Stack>
          </Paper>
        </Stack>
      </Grid>
    </Grid>
  );
}
