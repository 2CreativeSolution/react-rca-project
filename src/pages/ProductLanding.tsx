import TuneOutlinedIcon from "@mui/icons-material/TuneOutlined";
import { CircularProgress, FormControl, InputLabel, MenuItem, Paper, Select, Stack, Typography } from "@mui/material";
import { useCallback, useEffect, useMemo, useState } from "react";
import FilterToolbar from "../components/filters/FilterToolbar";
import { useNavigate } from "react-router-dom";
import ProductDetailsDialog from "../components/product/ProductDetailsDialog";
import ProductList from "../components/product/ProductList";
import { catalogGlassSurfaceSx } from "../components/catalog/styles";
import { PRODUCT_COPY } from "../constants/productContent";
import { ROUTES } from "../constants/routes";
import { useNotification } from "../context/useNotification";
import { getCatalogOptions, type CatalogOption } from "../services/catalog/catalogService";
import { listProducts, type ProductSummary } from "../services/salesforceApi";

const UNCATEGORIZED_FILTER_VALUE = "__filter_uncategorized__";

export default function ProductLanding() {
  const productLandingCopy = PRODUCT_COPY.landing;
  const [catalogOptions, setCatalogOptions] = useState<CatalogOption[]>([]);
  const [selectedCatalogId, setSelectedCatalogId] = useState("");
  const [products, setProducts] = useState<ProductSummary[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedProduct, setSelectedProduct] = useState<ProductSummary | null>(null);
  const [isCatalogLoading, setIsCatalogLoading] = useState(true);
  const [isProductsLoading, setIsProductsLoading] = useState(false);
  const navigate = useNavigate();
  const { notifyError } = useNotification();

  const loadCatalogOptions = useCallback(async () => {
    setIsCatalogLoading(true);
    try {
      const result = await getCatalogOptions();
      setCatalogOptions(result);
      if (result.length > 0) {
        setSelectedCatalogId((prevCatalogId) => {
          if (prevCatalogId && result.some((option) => option.id === prevCatalogId)) {
            return prevCatalogId;
          }
          return result[0].id;
        });
      } else {
        setSelectedCatalogId("");
        setProducts([]);
      }
    } catch (error) {
      setCatalogOptions([]);
      setSelectedCatalogId("");
      setProducts([]);
      const message = error instanceof Error ? error.message : productLandingCopy.fallbackErrorMessage;
      notifyError(message);
    } finally {
      setIsCatalogLoading(false);
    }
  }, [notifyError, productLandingCopy.fallbackErrorMessage]);

  useEffect(() => {
    void loadCatalogOptions();
  }, [loadCatalogOptions]);

  useEffect(() => {
    if (!selectedCatalogId) {
      return;
    }

    let isCurrentSelection = true;
    setIsProductsLoading(true);
    setSelectedProduct(null);

    void (async () => {
      try {
        const result = await listProducts({
          cataLogId: selectedCatalogId,
          searchProductName: "",
        });

        if (!isCurrentSelection) {
          return;
        }

        setProducts(result);
      } catch (error) {
        if (!isCurrentSelection) {
          return;
        }

        setProducts([]);
        const message = error instanceof Error ? error.message : productLandingCopy.fallbackErrorMessage;
        notifyError(message);
      } finally {
        if (isCurrentSelection) {
          setIsProductsLoading(false);
        }
      }
    })();

    return () => {
      isCurrentSelection = false;
    };
  }, [notifyError, productLandingCopy.fallbackErrorMessage, selectedCatalogId]);

  useEffect(() => {
    setSearchTerm("");
    setSelectedCategory("all");
  }, [selectedCatalogId]);

  const categoryFilterOptions = useMemo(() => {
    const categorySet = new Set<string>();
    let hasUncategorizedProducts = false;

    for (const product of products) {
      if (!product.categories.length) {
        hasUncategorizedProducts = true;
        continue;
      }

      for (const category of product.categories) {
        if (category.trim().length > 0) {
          categorySet.add(category);
        }
      }
    }

    const sortedCategories = [...categorySet].sort((a, b) => a.localeCompare(b));

    return [
      { value: "all", label: productLandingCopy.allCategoriesLabel },
      ...sortedCategories.map((category) => ({ value: category, label: category })),
      ...(hasUncategorizedProducts
        ? [{ value: UNCATEGORIZED_FILTER_VALUE, label: productLandingCopy.uncategorizedLabel }]
        : []),
    ];
  }, [productLandingCopy.allCategoriesLabel, productLandingCopy.uncategorizedLabel, products]);

  const filteredProducts = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    const categoryFiltered =
      selectedCategory === "all"
        ? products
        : selectedCategory === UNCATEGORIZED_FILTER_VALUE
          ? products.filter((product) => product.categories.length === 0)
          : products.filter((product) => product.categories.includes(selectedCategory));

    if (!normalizedSearch) {
      return categoryFiltered;
    }

    return categoryFiltered.filter((product) => {
      const haystack = [product.name, product.productCode ?? "", product.categories.join(" ")]
        .join(" ")
        .toLowerCase();
      return haystack.includes(normalizedSearch);
    });
  }, [products, searchTerm, selectedCategory]);

  const hasActiveProductFilters = searchTerm.trim().length > 0 || selectedCategory !== "all";

  useEffect(() => {
    const isSelectedOptionPresent = categoryFilterOptions.some((option) => option.value === selectedCategory);
    if (!isSelectedOptionPresent) {
      setSelectedCategory("all");
    }
  }, [categoryFilterOptions, selectedCategory]);

  if (isCatalogLoading) {
    return (
      <Stack alignItems="center" justifyContent="center" spacing={1.5} sx={{ py: 10 }}>
        <CircularProgress size={28} />
        <Typography color="text.secondary" variant="body2">
          {productLandingCopy.loadingMessage}
        </Typography>
      </Stack>
    );
  }

  return (
    <Stack spacing={2.5} sx={{ py: 1 }}>
      <Typography variant="h4">{productLandingCopy.title}</Typography>
      <Paper variant="outlined" sx={{ borderRadius: 2, p: 2.5 }}>
        <FormControl fullWidth>
          <InputLabel id="products-catalog-select-label">{productLandingCopy.catalogSelectLabel}</InputLabel>
          <Select
            labelId="products-catalog-select-label"
            value={selectedCatalogId}
            label={productLandingCopy.catalogSelectLabel}
            onChange={(event) => setSelectedCatalogId(event.target.value)}
            disabled={catalogOptions.length === 0}
          >
            {catalogOptions.map((option) => (
              <MenuItem key={option.id} value={option.id}>
                {option.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Paper>

      <Paper
        variant="outlined"
        sx={{
          ...catalogGlassSurfaceSx,
          px: { xs: 2.5, md: 3 },
          py: { xs: 2.25, md: 2.75 },
          borderRadius: 3,
        }}
      >
        <Stack spacing={1.25}>
          <Stack direction="row" alignItems="center" spacing={0.75}>
            <TuneOutlinedIcon fontSize="small" color="action" />
            <Typography variant="body2" color="text.secondary">
              {productLandingCopy.filtersTitle}
            </Typography>
          </Stack>
          <FilterToolbar
            search={{
              clearLabel: productLandingCopy.clearSearchLabel,
              label: productLandingCopy.searchLabel,
              onChange: setSearchTerm,
              onClear: () => setSearchTerm(""),
              placeholder: productLandingCopy.searchPlaceholder,
              value: searchTerm,
            }}
            primarySelect={{
              label: productLandingCopy.categoryFilterLabel,
              onChange: setSelectedCategory,
              options: categoryFilterOptions,
              value: selectedCategory,
            }}
            resultCount={{
              label: productLandingCopy.resultCountLabel,
              value: filteredProducts.length,
            }}
          />
        </Stack>
      </Paper>

      <ProductList
        catalogOptionsCount={catalogOptions.length}
        isProductsLoading={isProductsLoading}
        labels={{
          addToCartCtaLabel: productLandingCopy.addToCartCtaLabel,
          availabilityLabel: productLandingCopy.availabilityLabel,
          emptyCatalogMessage: productLandingCopy.emptyCatalogMessage,
          emptyMessage: hasActiveProductFilters ? productLandingCopy.emptyFilteredMessage : productLandingCopy.emptyMessage,
          loadingMessage: productLandingCopy.loadingMessage,
          notAvailableLabel: productLandingCopy.notAvailableLabel,
          productCodeLabel: productLandingCopy.productCodeLabel,
          productIdLabel: productLandingCopy.productIdLabel,
        }}
        onAddToCart={() => navigate(ROUTES.cart)}
        onSelectProduct={setSelectedProduct}
        products={filteredProducts}
      />

      <ProductDetailsDialog
        labels={{
          activeLabel: productLandingCopy.activeLabel,
          autoRenewLabel: productLandingCopy.autoRenewLabel,
          availabilityLabel: productLandingCopy.availabilityLabel,
          categoryLabel: productLandingCopy.categoryLabel,
          closeDetailsAriaLabel: productLandingCopy.closeDetailsAriaLabel,
          defaultOptionLabel: productLandingCopy.defaultOptionLabel,
          detailsTitleFallback: productLandingCopy.detailsTitleFallback,
          inactiveLabel: productLandingCopy.inactiveLabel,
          modelStatusLabel: productLandingCopy.modelStatusLabel,
          modelTypeLabel: productLandingCopy.modelTypeLabel,
          noLabel: productLandingCopy.noLabel,
          notAvailableLabel: productLandingCopy.notAvailableLabel,
          noSellingModelMessage: productLandingCopy.noSellingModelMessage,
          pricingTermLabel: productLandingCopy.pricingTermLabel,
          pricingTermUnitLabel: productLandingCopy.pricingTermUnitLabel,
          productCodeLabel: productLandingCopy.productCodeLabel,
          productIdLabel: productLandingCopy.productIdLabel,
          sellingModelsTitle: productLandingCopy.sellingModelsTitle,
          yesLabel: productLandingCopy.yesLabel,
        }}
        onClose={() => setSelectedProduct(null)}
        product={selectedProduct}
      />
    </Stack>
  );
}
