import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import FilterListRoundedIcon from "@mui/icons-material/FilterListRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import SortRoundedIcon from "@mui/icons-material/SortRounded";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
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
import type { DashboardOrder } from "../../services/salesforceApi";
import type { OrderBucket } from "../../store/dashboardStore";
import { formatCurrency, formatDate, formatDateTime, formatEta, formatProgress, mapStatusColor } from "../dashboard/formatters";

const ETA_TEXT_COLOR = "#0F4C81";

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
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
            <Paper variant="outlined" sx={{ borderRadius: 1.5, p: 1, flex: 1 }}>
              <Typography variant="caption" color="text.secondary">Fulfillment steps</Typography>
              <Typography variant="body2">
                {order.fulfillment?.completedSteps ?? "—"} / {order.fulfillment?.totalSteps ?? "—"}
              </Typography>
            </Paper>
            <Paper variant="outlined" sx={{ borderRadius: 1.5, p: 1, flex: 1 }}>
              <Typography variant="caption" color="text.secondary">In progress steps</Typography>
              <Typography variant="body2">{order.fulfillment?.inProgressSteps ?? "—"}</Typography>
            </Paper>
            <Paper variant="outlined" sx={{ borderRadius: 1.5, p: 1, flex: 1 }}>
              <Typography variant="caption" color="text.secondary">Failed steps</Typography>
              <Typography variant="body2">{order.fulfillment?.failedSteps ?? "—"}</Typography>
            </Paper>
            <Paper variant="outlined" sx={{ borderRadius: 1.5, p: 1, flex: 1 }}>
              <Typography variant="caption" color="text.secondary">Has fallout</Typography>
              <Typography variant="body2">
                {order.fulfillment?.hasFallout === null || order.fulfillment?.hasFallout === undefined
                  ? "Not available"
                  : order.fulfillment.hasFallout
                    ? "Yes"
                    : "No"}
              </Typography>
            </Paper>
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
