import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import ContentCopyOutlinedIcon from "@mui/icons-material/ContentCopyOutlined";
import {
  Box,
  Button,
  Chip,
  Divider,
  Drawer,
  Grid,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import type { CatalogItem } from "../../services/catalog/types";

type CatalogDetailsDrawerProps = {
  open: boolean;
  item: CatalogItem | null;
  correlationId: string;
  onClose: () => void;
  onCopyCorrelationId?: () => void;
  labels: {
    drawerTitleFallback: string;
    metadataLabel: string;
    overviewSectionLabel: string;
    datesSectionLabel: string;
    metadataSectionLabel: string;
    idLabel: string;
    typeLabel: string;
    categoriesLabel: string;
    codeLabel: string;
    descriptionLabel: string;
    startDateLabel: string;
    endDateLabel: string;
    noDataFallbackLabel: string;
    closeDrawerAriaLabel: string;
    copyCorrelationIdLabel: string;
    correlationIdLabel: string;
  };
};

type MetaRowProps = {
  label: string;
  value: string | number;
};

function MetaRow({ label, value }: MetaRowProps) {
  return (
    <Stack spacing={0.5}>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body2">{value}</Typography>
    </Stack>
  );
}

export default function CatalogDetailsDrawer({
  open,
  item,
  correlationId,
  onClose,
  onCopyCorrelationId,
  labels,
}: CatalogDetailsDrawerProps) {
  const fallbackValue = labels.noDataFallbackLabel;

  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <Box sx={{ width: { xs: "100vw", sm: 480 }, display: "flex", flexDirection: "column", height: "100%" }}>
        <Box sx={{ p: 2.5, pb: 2 }}>
          <Stack spacing={2.5}>
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1.5}>
              <Stack spacing={0.75}>
                <Typography variant="h6">{item?.name ?? labels.drawerTitleFallback}</Typography>
                {item ? <Chip label={item.catalogType} size="small" color="primary" variant="outlined" /> : null}
              </Stack>
              <IconButton onClick={onClose} aria-label={labels.closeDrawerAriaLabel}>
                <CloseOutlinedIcon />
              </IconButton>
            </Stack>

            <Divider />

            {item ? (
              <Stack spacing={2.25}>
                <Stack spacing={1}>
                  <Typography variant="subtitle2">{labels.overviewSectionLabel}</Typography>
                  <Grid container spacing={1.5}>
                    <Grid size={{ xs: 6 }}>
                      <MetaRow label={labels.idLabel} value={item.id || fallbackValue} />
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <MetaRow label={labels.typeLabel} value={item.catalogType || fallbackValue} />
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <MetaRow label={labels.categoriesLabel} value={item.numberOfCategories} />
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <MetaRow label={labels.codeLabel} value={item.code || fallbackValue} />
                    </Grid>
                  </Grid>
                </Stack>

                <Divider />

                <Stack spacing={1}>
                  <Typography variant="subtitle2">{labels.datesSectionLabel}</Typography>
                  <Grid container spacing={1.5}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <MetaRow label={labels.startDateLabel} value={item.effectiveStartDate || fallbackValue} />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <MetaRow label={labels.endDateLabel} value={item.effectiveEndDate || fallbackValue} />
                    </Grid>
                  </Grid>
                </Stack>

                <Divider />

                <Stack spacing={1}>
                  <Typography variant="subtitle2">{labels.metadataSectionLabel}</Typography>
                  <MetaRow label={labels.descriptionLabel} value={item.description || fallbackValue} />
                </Stack>
              </Stack>
            ) : null}
          </Stack>
        </Box>

        <Box
          sx={{
            mt: "auto",
            p: 2.5,
            pt: 2,
            borderTop: 1,
            borderColor: "divider",
            bgcolor: "rgba(17,24,39,0.02)",
          }}
        >
          <Stack spacing={1}>
            <Typography variant="caption" color="text.secondary">
              {labels.correlationIdLabel}
            </Typography>
            <Typography variant="body2" sx={{ wordBreak: "break-all" }}>
              {correlationId || fallbackValue}
            </Typography>
            <Button
              variant="outlined"
              size="small"
              startIcon={<ContentCopyOutlinedIcon fontSize="small" />}
              onClick={onCopyCorrelationId}
              disabled={!correlationId}
              sx={{ alignSelf: "flex-start" }}
            >
              {labels.copyCorrelationIdLabel}
            </Button>
          </Stack>
        </Box>
      </Box>
    </Drawer>
  );
}
