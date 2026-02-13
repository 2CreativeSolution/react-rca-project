import CategoryOutlinedIcon from "@mui/icons-material/CategoryOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import { Box, Card, CardContent, Grid, Stack, Typography } from "@mui/material";
import type { ReactNode } from "react";

type CatalogStatsProps = {
  totalCatalogs: number;
  totalCategories: number;
  labels: {
    totalCatalogsLabel: string;
    totalCategoriesLabel: string;
    totalCatalogsHelper: string;
    totalCategoriesHelper: string;
  };
};

type StatCardProps = {
  label: string;
  helper: string;
  value: number;
  icon: ReactNode;
  emphasized?: boolean;
};

function StatCard({ label, helper, value, icon, emphasized = false }: StatCardProps) {
  return (
    <Card
      variant="outlined"
      sx={{
        height: "100%",
        background: "rgba(255,255,255,0.88)",
      }}
    >
      <CardContent sx={{ height: "100%" }}>
        <Stack spacing={1.25} sx={{ height: "100%" }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
            <Typography color="text.secondary" variant="body2">
              {label}
            </Typography>
            <Box sx={{ color: "text.secondary", display: "inline-flex" }}>{icon}</Box>
          </Stack>
          <Typography variant={emphasized ? "h4" : "h5"}>{value}</Typography>
          <Typography color="text.secondary" variant="caption" sx={{ mt: "auto" }}>
            {helper}
          </Typography>
        </Stack>
      </CardContent>
    </Card>
  );
}

export default function CatalogStats({
  totalCatalogs,
  totalCategories,
  labels,
}: CatalogStatsProps) {
  return (
    <Grid container spacing={1.5} alignItems="stretch">
      <Grid size={{ xs: 12, md: 6 }}>
        <StatCard
          label={labels.totalCatalogsLabel}
          helper={labels.totalCatalogsHelper}
          value={totalCatalogs}
          icon={<Inventory2OutlinedIcon fontSize="small" />}
          emphasized
        />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <StatCard
          label={labels.totalCategoriesLabel}
          helper={labels.totalCategoriesHelper}
          value={totalCategories}
          icon={<CategoryOutlinedIcon fontSize="small" />}
        />
      </Grid>
    </Grid>
  );
}
