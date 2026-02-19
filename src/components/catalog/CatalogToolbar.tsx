import FilterToolbar from "../filters/FilterToolbar";
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
  const sortOptions = [
    { value: "nameAsc", label: labels.sortOptions.nameAsc },
    { value: "nameDesc", label: labels.sortOptions.nameDesc },
    { value: "categoriesDesc", label: labels.sortOptions.categoriesDesc },
    { value: "categoriesAsc", label: labels.sortOptions.categoriesAsc },
  ];

  return (
    <FilterToolbar
      search={{
        label: labels.searchLabel,
        placeholder: labels.searchPlaceholder,
        value: search,
        onChange: onSearchChange,
        onClear: onClearSearch,
        clearLabel: labels.clearSearchLabel,
      }}
      primarySelect={{
        label: labels.typeFilterLabel,
        value: catalogType,
        onChange: onCatalogTypeChange,
        options: [
          { value: "all", label: labels.allTypesLabel },
          ...catalogTypeOptions.map((type) => ({ value: type, label: type })),
        ],
      }}
      secondarySelect={{
        label: labels.sortLabel,
        value: sortBy,
        onChange: (value) => onSortByChange(value as CatalogSortBy),
        options: sortOptions,
      }}
      resultCount={{
        label: labels.resultCountLabel,
        value: resultCount,
      }}
    />
  );
}
