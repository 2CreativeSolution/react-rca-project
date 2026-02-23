import TuneOutlinedIcon from "@mui/icons-material/TuneOutlined";
import { Alert, Button, Grid, Paper, Skeleton, Stack, Typography } from "@mui/material";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import CatalogCard from "../components/catalog/CatalogCard";
import CatalogStats from "../components/catalog/CatalogStats";
import CatalogToolbar from "../components/catalog/CatalogToolbar";
import { catalogGlassSurfaceSx } from "../components/catalog/styles";
import { PRODUCT_COPY } from "../constants/productContent";
import { ROUTES } from "../constants/routes";
import { useNotification } from "../context/useNotification";
import { fetchCatalogs } from "../services/catalog/catalogService";
import type { CatalogItem, CatalogSortBy } from "../services/catalog/types";

const STICKY_TOP_OFFSET_PX = 76;
const MIN_LOADING_DURATION_MS = 900;

function bySortOption(items: CatalogItem[], sortBy: CatalogSortBy) {
  const clonedItems = [...items];

  switch (sortBy) {
    case "nameDesc":
      return clonedItems.sort((a, b) => b.name.localeCompare(a.name));
    case "categoriesDesc":
      return clonedItems.sort((a, b) => b.numberOfCategories - a.numberOfCategories);
    case "categoriesAsc":
      return clonedItems.sort((a, b) => a.numberOfCategories - b.numberOfCategories);
    case "nameAsc":
    default:
      return clonedItems.sort((a, b) => a.name.localeCompare(b.name));
  }
}

export default function Catalog() {
  const catalogCopy = PRODUCT_COPY.catalog;
  const { notifyError } = useNotification();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<CatalogItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [sortBy, setSortBy] = useState<CatalogSortBy>("nameAsc");
  const [hasLoadError, setHasLoadError] = useState(false);
  const [isActionsPanelStuck, setIsActionsPanelStuck] = useState(false);
  const stickySentinelRef = useRef<HTMLDivElement | null>(null);

  const loadCatalogs = useCallback(async () => {
    const startedAt = Date.now();
    setLoading(true);
    setHasLoadError(false);

    try {
      const data = await fetchCatalogs();
      setItems(data.items);
      setTotalCount(data.count);
    } catch (error) {
      setItems([]);
      setTotalCount(0);
      setHasLoadError(true);
      const message = error instanceof Error ? error.message : catalogCopy.fallbackErrorMessage;
      notifyError(message);
    } finally {
      const elapsed = Date.now() - startedAt;
      const remainingDelay = Math.max(0, MIN_LOADING_DURATION_MS - elapsed);
      if (remainingDelay > 0) {
        await new Promise((resolve) => setTimeout(resolve, remainingDelay));
      }
      setLoading(false);
    }
  }, [catalogCopy.fallbackErrorMessage, notifyError]);

  useEffect(() => {
    void loadCatalogs();
  }, [loadCatalogs]);

  useEffect(() => {
    const sentinel = stickySentinelRef.current;
    if (!sentinel || typeof IntersectionObserver === "undefined") {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsActionsPanelStuck(!entry.isIntersecting);
      },
      { threshold: [1] }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  const catalogTypeOptions = useMemo(() => {
    const uniqueTypes = new Set(items.map((item) => item.catalogType).filter(Boolean));
    return [...uniqueTypes].sort((a, b) => a.localeCompare(b));
  }, [items]);

  const filteredItems = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    const typeFilteredItems =
      selectedType === "all" ? items : items.filter((item) => item.catalogType === selectedType);
    const searchedItems = normalizedSearch
      ? typeFilteredItems.filter((item) => {
          const haystack = [item.name, item.code ?? "", item.description ?? ""].join(" ").toLowerCase();
          return haystack.includes(normalizedSearch);
        })
      : typeFilteredItems;

    return bySortOption(searchedItems, sortBy);
  }, [items, searchTerm, selectedType, sortBy]);

  const stats = useMemo(() => {
    const totalCategories = items.reduce((sum, item) => sum + item.numberOfCategories, 0);

    return {
      totalCatalogs: totalCount || items.length,
      totalCategories,
    };
  }, [items, totalCount]);

  const handleViewProducts = (item: CatalogItem) => {
    const searchParams = new URLSearchParams({ catalogId: item.id });
    navigate(
      {
        pathname: ROUTES.products,
        search: `?${searchParams.toString()}`,
      },
      {
        state: {
          fromCatalog: true,
        },
      }
    );
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setSelectedType("all");
    setSortBy("nameAsc");
  };

  const isFilteredResult = searchTerm.trim().length > 0 || selectedType !== "all";

  return (
    <Stack spacing={3} sx={{ py: 1.5 }}>
      <Paper
        variant="outlined"
        sx={{
          ...catalogGlassSurfaceSx,
          px: { xs: 2.5, md: 3.5 },
          py: { xs: 3, md: 3.5 },
          borderRadius: 4,
          overflow: "hidden",
          position: "relative",
          background:
            "radial-gradient(1000px 360px at 8% 0%, rgba(37,99,235,0.16) 0%, rgba(255,255,255,0.82) 58%), radial-gradient(840px 260px at 100% 100%, rgba(249,115,22,0.13) 0%, rgba(255,255,255,0.88) 62%)",
          "&::before": {
            content: "\"\"",
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.7)",
          },
        }}
      >
        <Stack spacing={1} sx={{ position: "relative", zIndex: 1 }}>
          <Typography variant="h4">{catalogCopy.pageTitle}</Typography>
          <Typography color="text.secondary" variant="body1">
            {catalogCopy.pageSubtitle}
          </Typography>
        </Stack>
      </Paper>

      {loading ? (
        <Grid container spacing={1.5} alignItems="stretch">
          <Grid size={{ xs: 12, md: 6 }}>
            <Paper variant="outlined" sx={{ p: 2.25, borderRadius: 3 }}>
              <Stack spacing={1}>
                <Skeleton variant="text" width="45%" />
                <Skeleton variant="text" width="32%" height={44} />
                <Skeleton variant="text" width="62%" />
              </Stack>
            </Paper>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Paper variant="outlined" sx={{ p: 2.25, borderRadius: 3 }}>
              <Stack spacing={1}>
                <Skeleton variant="text" width="45%" />
                <Skeleton variant="text" width="32%" height={44} />
                <Skeleton variant="text" width="62%" />
              </Stack>
            </Paper>
          </Grid>
        </Grid>
      ) : (
        <CatalogStats
          totalCatalogs={stats.totalCatalogs}
          totalCategories={stats.totalCategories}
          labels={{
            totalCatalogsLabel: catalogCopy.totalCatalogsLabel,
            totalCategoriesLabel: catalogCopy.totalCategoriesLabel,
            totalCatalogsHelper: catalogCopy.totalCatalogsHelper,
            totalCategoriesHelper: catalogCopy.totalCategoriesHelper,
          }}
        />
      )}

      <div ref={stickySentinelRef} aria-hidden="true" style={{ height: 1 }} />
      <Paper
        variant="outlined"
        sx={{
          ...catalogGlassSurfaceSx,
          px: { xs: 2.5, md: 3 },
          py: { xs: 2.25, md: 2.75 },
          borderRadius: 3,
          position: { md: "sticky" },
          top: { md: STICKY_TOP_OFFSET_PX },
          zIndex: 5,
          boxShadow: {
            xs: "none",
            md: isActionsPanelStuck
              ? "0 -10px 16px rgba(17, 24, 39, 0.10), 0 8px 22px rgba(17, 24, 39, 0.12)"
              : "none",
          },
        }}
      >
        {loading ? (
          <Stack spacing={1.25}>
            <Skeleton variant="text" width={120} />
            <Stack direction={{ xs: "column", md: "row" }} spacing={1.5}>
              <Skeleton variant="rounded" height={42} sx={{ flex: 1.2 }} />
              <Skeleton variant="rounded" height={42} sx={{ flex: 0.6 }} />
              <Skeleton variant="rounded" height={42} sx={{ flex: 0.65 }} />
              <Skeleton variant="rounded" height={42} sx={{ flex: 0.25 }} />
            </Stack>
          </Stack>
        ) : (
          <Stack spacing={1.25}>
            <Stack direction="row" alignItems="center" spacing={0.75}>
              <TuneOutlinedIcon fontSize="small" color="action" />
              <Typography variant="body2" color="text.secondary">
                {catalogCopy.sortLabel}
              </Typography>
            </Stack>
            <CatalogToolbar
              search={searchTerm}
              onSearchChange={setSearchTerm}
              onClearSearch={() => setSearchTerm("")}
              catalogType={selectedType}
              onCatalogTypeChange={setSelectedType}
              sortBy={sortBy}
              onSortByChange={setSortBy}
              resultCount={filteredItems.length}
              catalogTypeOptions={catalogTypeOptions}
              labels={{
                searchLabel: catalogCopy.searchLabel,
                searchPlaceholder: catalogCopy.searchPlaceholder,
                clearSearchLabel: catalogCopy.clearSearchLabel,
                typeFilterLabel: catalogCopy.typeFilterLabel,
                allTypesLabel: catalogCopy.allTypesLabel,
                sortLabel: catalogCopy.sortLabel,
                resultCountLabel: catalogCopy.resultCountLabel,
                sortOptions: catalogCopy.sortOptions,
              }}
            />
          </Stack>
        )}
      </Paper>

      {loading ? (
        <Grid container spacing={1.75}>
          {Array.from({ length: 6 }).map((_, index) => (
            <Grid key={index} size={{ xs: 12, sm: 6, lg: 4 }}>
              <Paper
                variant="outlined"
                sx={{
                  borderRadius: 3,
                  p: 2,
                  background: "linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.85) 100%)",
                }}
              >
                <Stack spacing={1.25}>
                  <Skeleton variant="rounded" width="100%" height={6} />
                  <Skeleton variant="text" width="72%" height={34} />
                  <Skeleton variant="text" width="36%" />
                  <Stack direction="row" spacing={1}>
                    <Skeleton variant="rounded" height={24} width={150} />
                    <Skeleton variant="rounded" height={24} width={120} />
                  </Stack>
                  <Skeleton variant="rounded" height={72} />
                  <Skeleton variant="rounded" height={36} width={142} />
                </Stack>
              </Paper>
            </Grid>
          ))}
        </Grid>
      ) : null}

      {!loading && hasLoadError ? (
        <Paper
          variant="outlined"
          sx={{
            ...catalogGlassSurfaceSx,
            p: 3,
            borderRadius: 3,
          }}
        >
          <Stack spacing={1.5} alignItems="flex-start">
            <Alert severity="error" variant="outlined">
              {catalogCopy.fallbackErrorMessage}
            </Alert>
            <Typography color="text.secondary" variant="body2">
              {catalogCopy.fallbackHelperMessage}
            </Typography>
            <Button variant="contained" onClick={() => void loadCatalogs()}>
              {catalogCopy.retryLabel}
            </Button>
          </Stack>
        </Paper>
      ) : null}

      {!loading && !hasLoadError && filteredItems.length === 0 ? (
        <Paper
          variant="outlined"
          sx={{
            ...catalogGlassSurfaceSx,
            p: 3,
            borderRadius: 3,
          }}
        >
          <Stack spacing={1.5} alignItems="flex-start">
            <Typography color="text.secondary" variant="body1">
              {isFilteredResult ? catalogCopy.emptyFilteredMessage : catalogCopy.emptyMessage}
            </Typography>
            {isFilteredResult ? (
              <Button variant="outlined" onClick={handleClearFilters}>
                {catalogCopy.clearFiltersLabel}
              </Button>
            ) : null}
          </Stack>
        </Paper>
      ) : null}

      {!loading && !hasLoadError && filteredItems.length > 0 ? (
        <Grid container spacing={1.75}>
          {filteredItems.map((item) => (
            <Grid key={item.id} size={{ xs: 12, sm: 6, lg: 4 }}>
              <CatalogCard
                item={item}
                onViewProducts={handleViewProducts}
                labels={{
                  viewProductsCtaLabel: catalogCopy.viewProductsCtaLabel,
                  categoriesLabel: catalogCopy.categoriesLabel,
                  codeLabel: catalogCopy.codeLabel,
                  startDateLabel: catalogCopy.startDateLabel,
                  endDateLabel: catalogCopy.endDateLabel,
                }}
              />
            </Grid>
          ))}
        </Grid>
      ) : null}
    </Stack>
  );
}
