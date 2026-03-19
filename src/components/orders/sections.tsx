import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import FilterListRoundedIcon from "@mui/icons-material/FilterListRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import SortRoundedIcon from "@mui/icons-material/SortRounded";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Button,
  Box,
  Chip,
  IconButton,
  Paper,
  Skeleton,
  Stack,
  Tab,
  Tabs,
  Typography,
  Tooltip,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { useMemo, useState } from "react";
import type { DashboardOrder, DashboardOrderFulfillmentStep } from "../../services/salesforceApi";
import type { OrderBucket } from "../../store/dashboardStore";
import { formatCurrency, formatDate, formatDateTime, formatEta, formatProgress, mapStatusColor } from "../dashboard/formatters";

const ETA_TEXT_COLOR = "#0F4C81";
const DEFAULT_VISIBLE_TIMELINE_STEPS = 6;

function toSortableTimestamp(value: string | null): number {
  if (!value) {
    return Number.POSITIVE_INFINITY;
  }

  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? Number.POSITIVE_INFINITY : parsed;
}

function sortStepsByPlannedTime(steps: DashboardOrderFulfillmentStep[]): DashboardOrderFulfillmentStep[] {
  return [...steps].sort((left, right) => {
    const plannedDifference =
      toSortableTimestamp(left.plannedCompletionDate) - toSortableTimestamp(right.plannedCompletionDate);
    if (plannedDifference !== 0) {
      return plannedDifference;
    }

    const startedDifference = toSortableTimestamp(left.actualStartDate) - toSortableTimestamp(right.actualStartDate);
    if (startedDifference !== 0) {
      return startedDifference;
    }

    return (left.name ?? "").localeCompare(right.name ?? "");
  });
}

type TimelineVisualState = {
  chipColor: "success" | "warning" | "error" | "info" | "default";
  dotColor: string;
  lineColor: string;
};

function normalizeText(value: string | null | undefined): string {
  return value?.trim().toLowerCase() ?? "";
}

function getTimelineVisualState(step: DashboardOrderFulfillmentStep): TimelineVisualState {
  const normalizedState = normalizeText(step.state);
  const normalizedJeopardy = normalizeText(step.jeopardyStatus);

  if (normalizedState.includes("complet")) {
    return {
      chipColor: "success",
      dotColor: "success.main",
      lineColor: alpha("#2e7d32", 0.35),
    };
  }

  if (normalizedState.includes("inprogress") || normalizedState.includes("in progress")) {
    return {
      chipColor: "warning",
      dotColor: "warning.main",
      lineColor: alpha("#ed6c02", 0.35),
    };
  }

  if (normalizedState.includes("fail") || normalizedJeopardy.includes("overdue")) {
    return {
      chipColor: "error",
      dotColor: "error.main",
      lineColor: alpha("#d32f2f", 0.35),
    };
  }

  if (normalizedState.includes("pending")) {
    return {
      chipColor: "info",
      dotColor: "info.main",
      lineColor: alpha("#0288d1", 0.3),
    };
  }

  return {
    chipColor: "default",
    dotColor: "text.disabled",
    lineColor: alpha("#9e9e9e", 0.28),
  };
}

export function OrdersHeader({
  disableRefresh,
  isRefreshing,
  onRefresh,
}: {
  disableRefresh: boolean;
  isRefreshing: boolean;
  onRefresh: () => Promise<void>;
}) {
  return (
    <Paper variant="outlined" sx={{ borderRadius: 3, p: { xs: 2.2, md: 2.6 } }}>
      <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={1.5}>
        <Stack spacing={0.7}>
          <Typography variant="h4">Orders Overview</Typography>
          <Typography color="text.secondary" variant="body2">
            Read-only operational view sourced from the dashboard endpoint.
          </Typography>
        </Stack>

        <Stack direction="row" spacing={0.75} useFlexGap flexWrap="wrap">
          <Tooltip title="Filter">
            <span>
              <IconButton
                disabled
                color="primary"
                size="small"
                sx={{
                  width: 28,
                  height: 28,
                  border: 1,
                  borderColor: "divider",
                  bgcolor: "background.paper",
                }}
              >
                <FilterListRoundedIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="Sort">
            <span>
              <IconButton
                disabled
                color="primary"
                size="small"
                sx={{
                  width: 28,
                  height: 28,
                  border: 1,
                  borderColor: "divider",
                  bgcolor: "background.paper",
                }}
              >
                <SortRoundedIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="Refresh">
            <span>
              <IconButton
                onClick={onRefresh}
                disabled={isRefreshing || disableRefresh}
                color="primary"
                size="small"
                sx={{
                  width: 28,
                  height: 28,
                  border: 1,
                  borderColor: "divider",
                  bgcolor: "background.paper",
                }}
              >
                <RefreshRoundedIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </span>
          </Tooltip>
        </Stack>
      </Stack>
    </Paper>
  );
}

export function OrdersError({ errorMessage, hideOnData }: { errorMessage: string | null; hideOnData: boolean }) {
  if (!errorMessage || hideOnData) {
    return null;
  }

  return <Alert severity="error">{errorMessage}</Alert>;
}

export function OrdersTabsBar({
  activeTab,
  onTabChange,
  counts,
}: {
  activeTab: OrderBucket;
  onTabChange: (next: OrderBucket) => void;
  counts: { inProgress: number; active: number; past: number };
}) {
  return (
    <Paper variant="outlined" sx={{ borderRadius: 2, px: 1, py: 0.9 }}>
      <Tabs
        value={activeTab}
        onChange={(_, value: OrderBucket) => onTabChange(value)}
        variant="scrollable"
        allowScrollButtonsMobile
        sx={{
          minHeight: 0,
          "& .MuiTabs-indicator": { display: "none" },
        }}
      >
        <Tab
          label={`In Progress (${counts.inProgress})`}
          value="inProgress"
          sx={{
            minHeight: 34,
            borderRadius: 999,
            border: 1,
            borderColor: "divider",
            mr: 1,
            px: 1.4,
            textTransform: "none",
            "&.Mui-selected": {
              color: "primary.main",
              bgcolor: "action.hover",
              borderColor: "primary.light",
            },
          }}
        />
        <Tab
          label={`Active (${counts.active})`}
          value="active"
          sx={{
            minHeight: 34,
            borderRadius: 999,
            border: 1,
            borderColor: "divider",
            mr: 1,
            px: 1.4,
            textTransform: "none",
            "&.Mui-selected": {
              color: "primary.main",
              bgcolor: "action.hover",
              borderColor: "primary.light",
            },
          }}
        />
        <Tab
          label={`Past (${counts.past})`}
          value="past"
          sx={{
            minHeight: 34,
            borderRadius: 999,
            border: 1,
            borderColor: "divider",
            px: 1.4,
            textTransform: "none",
            "&.Mui-selected": {
              color: "primary.main",
              bgcolor: "action.hover",
              borderColor: "primary.light",
            },
          }}
        />
      </Tabs>
    </Paper>
  );
}

function OrderDetailsGrid({ order }: { order: DashboardOrder }) {
  const [showAllTimelineSteps, setShowAllTimelineSteps] = useState(false);
  const fulfillmentSteps = useMemo(
    () => sortStepsByPlannedTime(order.fulfillment?.steps ?? []),
    [order.fulfillment?.steps]
  );
  const hasMoreSteps = fulfillmentSteps.length > DEFAULT_VISIBLE_TIMELINE_STEPS;
  const visibleSteps = showAllTimelineSteps ? fulfillmentSteps : fulfillmentSteps.slice(0, DEFAULT_VISIBLE_TIMELINE_STEPS);

  return (
    <Stack spacing={1.2}>
      <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
        <Paper variant="outlined" sx={{ borderRadius: 1.75, p: 1.05, flex: 1 }}>
          <Typography variant="caption" color="text.secondary">Activation time</Typography>
          <Typography variant="body2">{formatDateTime(order.activationTime)}</Typography>
        </Paper>
        <Paper variant="outlined" sx={{ borderRadius: 1.75, p: 1.05, flex: 1 }}>
          <Typography variant="caption" color="text.secondary">Eligibility</Typography>
          <Typography variant="body2">
            {order.isActivationEligible === null ? "Not available" : order.isActivationEligible ? "Eligible" : "Not eligible"}
          </Typography>
        </Paper>
        <Paper variant="outlined" sx={{ borderRadius: 1.75, p: 1.05, flex: 1 }}>
          <Typography variant="caption" color="text.secondary">Pending activation</Typography>
          <Typography variant="body2">
            {order.isActivationPending === null ? "Not available" : order.isActivationPending ? "Yes" : "No"}
          </Typography>
        </Paper>
      </Stack>

      <Accordion disableGutters elevation={0} sx={{ border: 1, borderColor: "divider", borderRadius: 1.75, overflow: "hidden" }}>
        <AccordionSummary expandIcon={<ExpandMoreRoundedIcon sx={{ fontSize: 18 }} />}>
          <Stack spacing={0.2}>
            <Typography variant="body2" fontWeight={700}>Fulfillment</Typography>
            <Typography variant="caption" color="text.secondary">
              {order.fulfillment?.state ?? "Not available"}
            </Typography>
          </Stack>
        </AccordionSummary>
        <AccordionDetails>
          <Stack direction="row" spacing={1.25} useFlexGap flexWrap="wrap">
            <Stack direction="row" alignItems="center" spacing={0.6}>
              <Box sx={{ width: 7, height: 7, borderRadius: "50%", bgcolor: "success.main" }} />
              <Typography variant="caption" color="text.secondary">
                {order.fulfillment?.completedSteps ?? "—"} / {order.fulfillment?.totalSteps ?? "—"}
              </Typography>
            </Stack>
            <Stack direction="row" alignItems="center" spacing={0.6}>
              <Box sx={{ width: 7, height: 7, borderRadius: "50%", bgcolor: "warning.main" }} />
              <Typography variant="caption" color="text.secondary">
                {order.fulfillment?.inProgressSteps ?? "—"}
              </Typography>
            </Stack>
            <Stack direction="row" alignItems="center" spacing={0.6}>
              <Box sx={{ width: 7, height: 7, borderRadius: "50%", bgcolor: "error.main" }} />
              <Typography variant="caption" color="text.secondary">
                {order.fulfillment?.failedSteps ?? "—"}
              </Typography>
            </Stack>
            <Stack direction="row" alignItems="center" spacing={0.6}>
              <Box
                sx={{
                  width: 7,
                  height: 7,
                  borderRadius: "50%",
                  bgcolor:
                    order.fulfillment?.hasFallout === null || order.fulfillment?.hasFallout === undefined
                      ? "text.disabled"
                      : order.fulfillment.hasFallout
                        ? "error.main"
                        : "success.main",
                }}
              />
              <Typography variant="caption" color="text.secondary">
                {
                  order.fulfillment?.hasFallout === null || order.fulfillment?.hasFallout === undefined
                    ? "Not available"
                    : order.fulfillment.hasFallout
                      ? "Yes"
                      : "No"
                }
              </Typography>
            </Stack>
          </Stack>

          <Stack spacing={1} sx={{ mt: 1.2 }}>
            <Typography variant="caption" color="text.secondary">Timeline (planned order)</Typography>
            {visibleSteps.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No step timeline returned for this order state yet.
              </Typography>
            ) : (
              <Stack spacing={0.9}>
                {visibleSteps.map((step, index) => {
                  const isLast = index === visibleSteps.length - 1;
                  const timelineVisualState = getTimelineVisualState(step);
                  return (
                    <Box key={step.id ?? `${step.name ?? "step"}-${index}`} sx={{ display: "flex", gap: 1.1 }}>
                      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", width: 12, pt: 0.45 }}>
                        <Box
                          sx={{
                            width: 7,
                            height: 7,
                            borderRadius: "50%",
                            bgcolor: timelineVisualState.dotColor,
                          }}
                        />
                        {!isLast ? (
                          <Box
                            sx={{
                              mt: 0.35,
                              width: 0.75,
                              flex: 1,
                              minHeight: 16,
                              bgcolor: timelineVisualState.lineColor,
                              borderRadius: 999,
                            }}
                          />
                        ) : null}
                      </Box>
                      <Paper variant="outlined" sx={{ borderRadius: 1.5, px: 1, py: 0.8, flex: 1 }}>
                        <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
                          <Typography variant="body2" fontWeight={600}>
                            {step.name ?? "Unnamed step"}
                          </Typography>
                          <Tooltip title={step.state ?? "Not available"}>
                            <Box
                              sx={{
                                width: 6,
                                height: 6,
                                borderRadius: "50%",
                                bgcolor: timelineVisualState.dotColor,
                              }}
                            />
                          </Tooltip>
                        </Stack>
                        <Typography variant="caption" color="text.secondary">
                          {(step.stepType ?? "Step")} • {step.jeopardyStatus ?? "No jeopardy"}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.2 }}>
                          Planned: {formatDateTime(step.plannedCompletionDate)}
                        </Typography>
                      </Paper>
                    </Box>
                  );
                })}
              </Stack>
            )}
            {hasMoreSteps ? (
              <Box>
                <Button
                  size="small"
                  variant="text"
                  onClick={() => setShowAllTimelineSteps((previous) => !previous)}
                  sx={{ px: 0, minWidth: "auto" }}
                >
                  {showAllTimelineSteps ? "Show fewer steps" : `Show all steps (${fulfillmentSteps.length})`}
                </Button>
              </Box>
            ) : null}
          </Stack>
        </AccordionDetails>
      </Accordion>

      <Box>
        <Typography variant="caption" color="text.secondary">Notes</Typography>
        <Typography variant="body2">{order.notes ?? "Not available"}</Typography>
      </Box>
    </Stack>
  );
}

function OrderRowAccordion({ order }: { order: DashboardOrder }) {
  return (
    <Accordion
      disableGutters
      elevation={0}
      sx={{
        border: 1,
        borderColor: "divider",
        borderRadius: 2,
        overflow: "hidden",
        px: 0.65,
        py: 0.5,
      }}
    >
      <AccordionSummary
        expandIcon={<ExpandMoreRoundedIcon />}
        sx={{
          alignItems: "center",
          px: 1.05,
          py: 0.4,
          minHeight: 0,
          "& .MuiAccordionSummary-content": {
            margin: 0,
          },
          "& .MuiAccordionSummary-expandIconWrapper": {
            alignSelf: "center",
          },
        }}
      >
        <Stack width="100%" spacing={0.9}>
          <Stack
            direction="row"
            justifyContent="space-between"
            spacing={1}
            alignItems="center"
            sx={{ minHeight: 28 }}
          >
            <Typography variant="body1" fontWeight={800}>{order.orderId}</Typography>
          </Stack>

          <Stack direction={{ xs: "column", md: "row" }} spacing={{ xs: 0.4, md: 2.5 }} alignItems={{ md: "center" }}>
            <Typography variant="caption" color="text.secondary">Amount: {formatCurrency(order.amount)}</Typography>
            <Typography variant="caption" color="text.secondary">Effective date: {formatDate(order.effectiveDate)}</Typography>
            <Typography variant="caption" color="text.secondary">Activation progress: {formatProgress(order.activationProgressPercent)}</Typography>
            <Typography variant="caption" sx={{ color: ETA_TEXT_COLOR, fontWeight: 600 }}>
              ETA: {formatEta(order.hoursRemaining, order.minutesRemaining)}
            </Typography>
            <Chip
              color={mapStatusColor(order.fulfillment?.state ?? order.status)}
              label={order.fulfillment?.state ?? order.status ?? "Not available"}
              size="small"
              variant="outlined"
              sx={{ alignSelf: { xs: "flex-start", md: "center" } }}
            />
          </Stack>
        </Stack>
      </AccordionSummary>

      <AccordionDetails>
        <Box sx={{ px: 0.45, pb: 0.35 }}>
        <OrderDetailsGrid order={order} />
        </Box>
      </AccordionDetails>
    </Accordion>
  );
}

export function OrdersList({
  isLoading,
  orders,
}: {
  isLoading: boolean;
  orders: DashboardOrder[];
}) {
  return (
    <Paper variant="outlined" sx={{ borderRadius: 2, p: 1.2 }}>
      <Stack spacing={1.1}>
      {!isLoading && orders.length > 0 ? (
        <Paper variant="outlined" sx={{ borderRadius: 1.75, px: 1.3, py: 0.9 }}>
          <Stack direction="row" spacing={1.2}>
            <Typography variant="caption" color="text.secondary" sx={{ width: "26%" }}>Order</Typography>
            <Typography variant="caption" color="text.secondary" sx={{ width: "14%" }}>Status</Typography>
            <Typography variant="caption" color="text.secondary" sx={{ width: "14%" }}>Amount</Typography>
            <Typography variant="caption" color="text.secondary" sx={{ width: "16%" }}>Effective Date</Typography>
            <Typography variant="caption" color="text.secondary" sx={{ width: "15%" }}>Activation</Typography>
            <Typography variant="caption" color="text.secondary" sx={{ width: "15%" }}>Fulfillment</Typography>
          </Stack>
        </Paper>
      ) : null}

      {isLoading
        ? Array.from({ length: 3 }).map((_, index) => (
            <Paper key={index} variant="outlined" sx={{ borderRadius: 1.75, p: 1.6 }}>
              <Stack spacing={1}>
                <Skeleton variant="text" width="25%" />
                <Skeleton variant="text" width="80%" />
                <Skeleton variant="text" width="65%" />
              </Stack>
            </Paper>
          ))
        : orders.map((order) => <OrderRowAccordion key={order.orderId} order={order} />)}

      {!isLoading && orders.length === 0 ? (
        <Paper variant="outlined" sx={{ borderRadius: 1.75, p: 1.6 }}>
          <Typography color="text.secondary" variant="body2">No orders are available for this section.</Typography>
        </Paper>
      ) : null}
      </Stack>
    </Paper>
  );
}
