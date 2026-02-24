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

export type FilterOption = {
  label: string;
  value: string;
};

type FilterSearchConfig = {
  clearLabel: string;
  label: string;
  onChange: (value: string) => void;
  onClear?: () => void;
  placeholder: string;
  value: string;
};

type FilterSelectConfig = {
  label: string;
  onChange: (value: string) => void;
  options: FilterOption[];
  value: string;
};

type FilterResultCountConfig = {
  label: string;
  value: number;
};

type FilterToolbarProps = {
  direction?: "row" | "column";
  primarySelect: FilterSelectConfig;
  resultCount?: FilterResultCountConfig;
  search: FilterSearchConfig;
  secondarySelect?: FilterSelectConfig;
};

export default function FilterToolbar({
  direction = "row",
  primarySelect,
  resultCount,
  search,
  secondarySelect,
}: FilterToolbarProps) {
  return (
    <Stack
      direction={{ xs: "column", md: direction }}
      spacing={1.5}
      alignItems={{ md: direction === "row" ? "center" : "stretch" }}
    >
      <TextField
        label={search.label}
        placeholder={search.placeholder}
        value={search.value}
        sx={{ flex: 1.2 }}
        onChange={(event) => search.onChange(event.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchOutlinedIcon fontSize="small" color="action" />
            </InputAdornment>
          ),
          endAdornment:
            search.value.trim().length > 0 && search.onClear ? (
              <InputAdornment position="end">
                <Button
                  variant="text"
                  size="small"
                  color="inherit"
                  startIcon={<CloseRoundedIcon fontSize="small" />}
                  onClick={search.onClear}
                >
                  {search.clearLabel}
                </Button>
              </InputAdornment>
            ) : undefined,
        }}
      />

      <FormControl size="small" sx={{ minWidth: { xs: "100%", md: 190 }, flex: { md: 0.6 } }}>
        <InputLabel id="filters-primary-select-label">{primarySelect.label}</InputLabel>
        <Select
          labelId="filters-primary-select-label"
          label={primarySelect.label}
          value={primarySelect.value}
          onChange={(event) => primarySelect.onChange(event.target.value)}
        >
          {primarySelect.options.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {secondarySelect ? (
        <FormControl size="small" sx={{ minWidth: { xs: "100%", md: 210 }, flex: { md: 0.65 } }}>
          <InputLabel id="filters-secondary-select-label">{secondarySelect.label}</InputLabel>
          <Select
            labelId="filters-secondary-select-label"
            label={secondarySelect.label}
            value={secondarySelect.value}
            onChange={(event) => secondarySelect.onChange(event.target.value)}
          >
            {secondarySelect.options.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      ) : null}

      {resultCount ? (
        <TextField
          label={resultCount.label}
          value={resultCount.value}
          InputProps={{ readOnly: true }}
          sx={{ minWidth: { xs: "100%", md: 130 }, flex: { md: 0.25 } }}
        />
      ) : null}
    </Stack>
  );
}
