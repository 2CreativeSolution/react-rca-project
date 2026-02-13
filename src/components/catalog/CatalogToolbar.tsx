import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import {
  Button,
  FormControl,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
} from "@mui/material";
import type { CatalogSortBy } from "../../services/catalog/types";

type CatalogToolbarProps = {
  search: string;
  onSearchChange: (value: string) => void;
  catalogType: string;
  onCatalogTypeChange: (value: string) => void;
  sortBy: CatalogSortBy;
  onSortByChange: (value: CatalogSortBy) => void;
  catalogTypeOptions: string[];
  resultCount: number;
  onClearSearch?: () => void;
  labels: {
    searchLabel: string;
    searchPlaceholder: string;
    clearSearchLabel: string;
    typeFilterLabel: string;
    allTypesLabel: string;
    sortLabel: string;
    resultCountLabel: string;
    sortOptions: Record<CatalogSortBy, string>;
  };
};

export default function CatalogToolbar({
  search,
  onSearchChange,
  catalogType,
  onCatalogTypeChange,
  sortBy,
  onSortByChange,
  catalogTypeOptions,
  resultCount,
  onClearSearch,
  labels,
}: CatalogToolbarProps) {
  return (
    <Stack direction={{ xs: "column", md: "row" }} spacing={1.5} alignItems={{ md: "center" }}>
      <TextField
        label={labels.searchLabel}
        placeholder={labels.searchPlaceholder}
        value={search}
        sx={{ flex: 1.2 }}
        onChange={(event) => onSearchChange(event.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchOutlinedIcon fontSize="small" color="action" />
            </InputAdornment>
          ),
          endAdornment:
            search.trim().length > 0 && onClearSearch ? (
              <InputAdornment position="end">
                <Button
                  variant="text"
                  size="small"
                  color="inherit"
                  startIcon={<CloseRoundedIcon fontSize="small" />}
                  onClick={onClearSearch}
                >
                  {labels.clearSearchLabel}
                </Button>
              </InputAdornment>
            ) : undefined,
        }}
      />

      <FormControl size="small" sx={{ minWidth: { xs: "100%", md: 190 }, flex: { md: 0.6 } }}>
        <InputLabel id="catalog-type-filter-label">{labels.typeFilterLabel}</InputLabel>
        <Select
          labelId="catalog-type-filter-label"
          label={labels.typeFilterLabel}
          value={catalogType}
          onChange={(event) => onCatalogTypeChange(event.target.value)}
        >
          <MenuItem value="all">{labels.allTypesLabel}</MenuItem>
          {catalogTypeOptions.map((type) => (
            <MenuItem key={type} value={type}>
              {type}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl size="small" sx={{ minWidth: { xs: "100%", md: 210 }, flex: { md: 0.65 } }}>
        <InputLabel id="catalog-sort-label">{labels.sortLabel}</InputLabel>
        <Select
          labelId="catalog-sort-label"
          label={labels.sortLabel}
          value={sortBy}
          onChange={(event) => onSortByChange(event.target.value as CatalogSortBy)}
        >
          <MenuItem value="nameAsc">{labels.sortOptions.nameAsc}</MenuItem>
          <MenuItem value="nameDesc">{labels.sortOptions.nameDesc}</MenuItem>
          <MenuItem value="categoriesDesc">{labels.sortOptions.categoriesDesc}</MenuItem>
          <MenuItem value="categoriesAsc">{labels.sortOptions.categoriesAsc}</MenuItem>
        </Select>
      </FormControl>

      <TextField
        label={labels.resultCountLabel}
        value={resultCount}
        InputProps={{ readOnly: true }}
        sx={{ minWidth: { xs: "100%", md: 130 }, flex: { md: 0.25 } }}
      />
    </Stack>
  );
}
