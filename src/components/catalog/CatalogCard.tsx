import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import CategoryOutlinedIcon from "@mui/icons-material/CategoryOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import SellOutlinedIcon from "@mui/icons-material/SellOutlined";
import {
  Button,
  Card,
  CardActions,
  CardContent,
  Chip,
  Divider,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import type { CatalogItem } from "../../services/catalog/types";
import { catalogPremiumCardSx } from "./styles";

type CatalogCardProps = {
  item: CatalogItem;
  onViewProducts: (item: CatalogItem) => void;
  labels: {
    viewProductsCtaLabel: string;
    categoriesLabel: string;
    codeLabel: string;
    startDateLabel: string;
    endDateLabel: string;
  };
};

function dateRangeLabel(item: CatalogItem, labels: CatalogCardProps["labels"]) {
  if (item.effectiveStartDate && item.effectiveEndDate) {
    return `${labels.startDateLabel}: ${item.effectiveStartDate} • ${labels.endDateLabel}: ${item.effectiveEndDate}`;
  }
  if (item.effectiveStartDate) {
    return `${labels.startDateLabel}: ${item.effectiveStartDate}`;
  }
  if (item.effectiveEndDate) {
    return `${labels.endDateLabel}: ${item.effectiveEndDate}`;
  }
  return null;
}

export default function CatalogCard({ item, onViewProducts, labels }: CatalogCardProps) {
  const effectiveDateLabel = dateRangeLabel(item, labels);
  const pillSx = {
    px: 0.65,
    py: 0.35,
    height: 30,
    borderRadius: 999,
    "& .MuiChip-label": {
      fontSize: "0.82rem",
      fontWeight: 500,
      letterSpacing: "0.01em",
      px: 1.15,
      py: 0.35,
    },
    "& .MuiChip-icon": {
      ml: 0.8,
      mr: -0.4,
      fontSize: "0.95rem",
    },
  } as const;

  return (
    <Card variant="outlined" sx={catalogPremiumCardSx}>
      <CardContent sx={{ flex: 1, pt: 2.5 }}>
        <Stack spacing={1.5}>
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
            <Typography variant="h6" sx={{ lineHeight: 1.2 }}>
              {item.name}
            </Typography>
            <Chip label={item.catalogType} size="small" variant="outlined" />
          </Stack>

          <Stack direction="row" spacing={0.8} flexWrap="wrap" useFlexGap>
            <Chip
              icon={<CategoryOutlinedIcon />}
              label={`${labels.categoriesLabel}: ${item.numberOfCategories}`}
              size="small"
              variant="outlined"
              sx={pillSx}
            />
            {item.code ? (
              <Chip
                icon={<SellOutlinedIcon />}
                label={`${labels.codeLabel}: ${item.code}`}
                size="small"
                variant="outlined"
                sx={pillSx}
              />
            ) : null}
          </Stack>

          {item.description ? (
            <Tooltip title={item.description} placement="top-start">
              <Stack direction="row" spacing={1} alignItems="flex-start">
                <InfoOutlinedIcon fontSize="small" color="action" sx={{ mt: 0.2 }} />
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    display: "-webkit-box",
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  {item.description}
                </Typography>
              </Stack>
            </Tooltip>
          ) : null}

          {effectiveDateLabel ? (
            <>
              <Divider />
              <Stack direction="row" spacing={1} alignItems="center">
                <CalendarMonthOutlinedIcon fontSize="small" color="action" />
                <Typography variant="body2" color="text.secondary">
                  {effectiveDateLabel}
                </Typography>
              </Stack>
            </>
          ) : null}
        </Stack>
      </CardContent>

      <CardActions sx={{ px: 2, pb: 2 }}>
        <Button
          variant="outlined"
          onClick={() => onViewProducts(item)}
          sx={{
            "&:focus-visible": {
              outline: "2px solid",
              outlineColor: "primary.main",
              outlineOffset: 1,
            },
          }}
        >
          {labels.viewProductsCtaLabel}
        </Button>
      </CardActions>
    </Card>
  );
}
