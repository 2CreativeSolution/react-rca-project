import TuneOutlinedIcon from "@mui/icons-material/TuneOutlined";
import { CircularProgress, FormControl, InputLabel, MenuItem, Paper, Select, Stack, Typography } from "@mui/material";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import FilterToolbar from "../components/filters/FilterToolbar";
import { useSearchParams } from "react-router-dom";
import ProductDetailsDialog from "../components/product/ProductDetailsDialog";
import ProductList from "../components/product/ProductList";
import { catalogGlassSurfaceSx } from "../components/catalog/styles";
import { PRODUCT_COPY } from "../constants/productContent";
import { useAuth } from "../context/useAuth";
import { useNotification } from "../context/useNotification";
import { getCatalogOptions, type CatalogOption } from "../services/catalog/catalogService";
import { addProductsToCart, listProducts, type ProductSummary } from "../services/salesforceApi";

const UNCATEGORIZED_FILTER_VALUE = "__filter_uncategorized__";

export default function ProductLanding() {
  const productLandingCopy = PRODUCT_COPY.landing;
  const [catalogOptions, setCatalogOptions] = useState<CatalogOption[]>([]);
  const [selectedCatalogId, setSelectedCatalogId] = useState("");
  const [products, setProducts] = useState<ProductSummary[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedProduct, setSelectedProduct] = useState<ProductSummary | null>(null);
  const [addToCartProductId, setAddToCartProductId] = useState<string | null>(null);
  const [isCatalogLoading, setIsCatalogLoading] = useState(true);
  const [isProductsLoading, setIsProductsLoading] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedCatalogParam = searchParams.get("catalogId")?.trim() ?? "";
  const initialCatalogParamRef = useRef(selectedCatalogParam);
  const { decisionSession } = useAuth();
  const { notifyError, notifySuccess, notifyWarning } = useNotification();

  const loadCatalogOptions = useCallback(async () => {
    setIsCatalogLoading(true);
    try {
      const result = await getCatalogOptions();
      setCatalogOptions(result);
      if (result.length > 0) {
        setSelectedCatalogId((prevCatalogId) => {
          const preferredCatalogId = initialCatalogParamRef.current;
          if (preferredCatalogId && result.some((option) => option.id === preferredCatalogId)) {
            return preferredCatalogId;
          }
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
    if (!selectedCatalogParam) {
      return;
    }

    if (!catalogOptions.some((option) => option.id === selectedCatalogParam)) {
      return;
    }

    setSelectedCatalogId((currentCatalogId) =>
      currentCatalogId === selectedCatalogParam ? currentCatalogId : selectedCatalogParam
    );
  }, [catalogOptions, selectedCatalogParam]);

  useEffect(() => {
    const hasValidCatalogParam =
      selectedCatalogParam.length > 0 && catalogOptions.some((option) => option.id === selectedCatalogParam);

    if (!selectedCatalogId || isCatalogLoading) {
      return;
    }

    if (hasValidCatalogParam && selectedCatalogId !== selectedCatalogParam) {
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
  }, [
    catalogOptions,
    isCatalogLoading,
    notifyError,
    productLandingCopy.fallbackErrorMessage,
    selectedCatalogId,
    selectedCatalogParam,
  ]);

  useEffect(() => {
    setSearchTerm("");
    setSelectedCategory("all");
  }, [selectedCatalogId]);

  useEffect(() => {
    if (!selectedCatalogId) {
      return;
    }

    if (selectedCatalogId === selectedCatalogParam) {
      return;
    }

    const nextParams = new URLSearchParams(searchParams);
    nextParams.set("catalogId", selectedCatalogId);
    setSearchParams(nextParams, { replace: true });
  }, [searchParams, selectedCatalogId, selectedCatalogParam, setSearchParams]);

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

  const resolveBillingFrequency = useCallback((pricingTermUnit?: string): string | undefined => {
    if (!pricingTermUnit) {
      return undefined;
    }

    const normalizedUnit = pricingTermUnit.toLowerCase();
    if (normalizedUnit.includes("month")) {
      return "Monthly";
    }
    if (normalizedUnit.includes("quarter")) {
      return "Quarterly";
    }
    if (normalizedUnit.includes("week")) {
      return "Weekly";
    }
    if (normalizedUnit.includes("day")) {
      return "Daily";
    }
    if (normalizedUnit.includes("year") || normalizedUnit.includes("annual")) {
      return "Annual";
    }
    return undefined;
  }, []);

  const isCommitmentStyleModel = useCallback((sellingModelType?: string): boolean => {
    if (!sellingModelType) {
      return false;
    }

    const normalizedType = sellingModelType.toLowerCase();
    return (
      normalizedType.includes("commitment")
      || normalizedType.includes("token")
      || normalizedType.includes("usage")
      || normalizedType.includes("consumption")
      || normalizedType.includes("credit")
    );
  }, []);

  const toIntegrationErrorMessage = useCallback(
    (error: unknown): string => {
      if (!(error instanceof Error)) {
        return productLandingCopy.addToCartErrorMessage;
      }

      const rawMessage = error.message;
      const payloadStart = rawMessage.indexOf("{");
      if (payloadStart < 0) {
        return rawMessage;
      }

      try {
        const parsed = JSON.parse(rawMessage.slice(payloadStart)) as {
          message?: unknown;
          status?: { message?: unknown; errors?: Array<{ messageDetail?: unknown; messageTitle?: unknown; message?: unknown }> };
          errorResponse?: Array<{ message?: unknown }>;
        };

        const cartApiMessage = parsed.errorResponse?.find((entry) => typeof entry.message === "string")?.message;
        if (typeof cartApiMessage === "string" && cartApiMessage.trim().length > 0) {
          return cartApiMessage.replace(/&#39;/g, "'");
        }

        const productApiMessage = parsed.status?.errors?.find((entry) => typeof entry.messageDetail === "string")?.messageDetail;
        if (typeof productApiMessage === "string" && productApiMessage.trim().length > 0) {
          return productApiMessage;
        }

        if (typeof parsed.status?.message === "string" && parsed.status.message.trim().length > 0) {
          return parsed.status.message;
        }

        if (typeof parsed.message === "string" && parsed.message.trim().length > 0) {
          return parsed.message;
        }
      } catch {
        // Keep original message when backend payload is not valid JSON.
      }

      return rawMessage;
    },
    [productLandingCopy.addToCartErrorMessage]
  );

  const handleAddToCart = useCallback(
    async (product: ProductSummary) => {
      const quoteId = decisionSession.quoteId?.trim() ?? "";
      if (!quoteId) {
        notifyWarning(productLandingCopy.missingQuoteWarningMessage);
        return;
      }

      const selectedOption = product.productSellingModelOptions.find((option) => option.isDefault)
        ?? product.productSellingModelOptions[0];
      const selectedModel = selectedOption?.model;
      const productId = product.id;
      const matchedEntry = product.pricebookEntries.find(
        (entry) => entry.productSellingModelId && entry.productSellingModelId === selectedModel?.id
      );
      const pricebookEntryId = selectedOption?.pricebookEntryId ?? matchedEntry?.id;
      const unitPrice = selectedOption?.unitPrice ?? matchedEntry?.unitPrice;

      if (!productId || !pricebookEntryId || typeof unitPrice !== "number") {
        notifyWarning(productLandingCopy.addToCartPreconditionWarningMessage);
        return;
      }

      const payloadItem: {
        Product2Id: string;
        PricebookEntryId: string;
        UnitPrice: string;
        Quantity: string;
        PeriodBoundary?: string;
        BillingFrequency?: string;
      } = {
        Product2Id: productId,
        PricebookEntryId: pricebookEntryId,
        UnitPrice: unitPrice.toString(),
        Quantity: "1",
      };

      const sellingModelType = selectedModel?.sellingModelType;
      if (isCommitmentStyleModel(sellingModelType)) {
        notifyWarning(productLandingCopy.addToCartCommitmentUnsupportedWarningMessage);
        return;
      }

      const normalizedSellingModelType = sellingModelType?.toLowerCase() ?? "";
      const isSubscriptionModel =
        normalizedSellingModelType.includes("subscription")
        || normalizedSellingModelType.includes("term")
        || normalizedSellingModelType.includes("evergreen");
      if (isSubscriptionModel) {
        const billingFrequency = resolveBillingFrequency(selectedModel?.pricingTermUnit);
        if (!billingFrequency) {
          notifyWarning(productLandingCopy.addToCartMissingBillingFrequencyWarningMessage);
          return;
        }

        payloadItem.PeriodBoundary = "Anniversary";
        payloadItem.BillingFrequency = billingFrequency;
      }

      setAddToCartProductId(productId);
      try {
        const response = await addProductsToCart({
          quoteID: quoteId,
          productsToAddList: [payloadItem],
        });

        if (!response.isSuccess) {
          throw new Error(response.message ?? productLandingCopy.addToCartErrorMessage);
        }

        notifySuccess(response.message ?? productLandingCopy.addToCartSuccessMessage);
      } catch (error) {
        notifyError(toIntegrationErrorMessage(error));
      } finally {
        setAddToCartProductId((currentProductId) => (currentProductId === productId ? null : currentProductId));
      }
    },
    [
      decisionSession.quoteId,
      notifyError,
      notifySuccess,
      notifyWarning,
      productLandingCopy.addToCartErrorMessage,
      productLandingCopy.addToCartCommitmentUnsupportedWarningMessage,
      productLandingCopy.addToCartMissingBillingFrequencyWarningMessage,
      productLandingCopy.addToCartPreconditionWarningMessage,
      productLandingCopy.addToCartSuccessMessage,
      productLandingCopy.missingQuoteWarningMessage,
      isCommitmentStyleModel,
      resolveBillingFrequency,
      toIntegrationErrorMessage,
    ]
  );

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
        isAddToCartDisabled={(product) => {
          return !product.id || addToCartProductId === product.id;
        }}
        isAddToCartLoading={(product) => Boolean(product.id && addToCartProductId === product.id)}
        labels={{
          addToCartCtaLabel: productLandingCopy.addToCartCtaLabel,
          addingToCartCtaLabel: productLandingCopy.addingToCartCtaLabel,
          availabilityLabel: productLandingCopy.availabilityLabel,
          emptyCatalogMessage: productLandingCopy.emptyCatalogMessage,
          emptyMessage: hasActiveProductFilters ? productLandingCopy.emptyFilteredMessage : productLandingCopy.emptyMessage,
          loadingMessage: productLandingCopy.loadingMessage,
          notAvailableLabel: productLandingCopy.notAvailableLabel,
          productCodeLabel: productLandingCopy.productCodeLabel,
          productIdLabel: productLandingCopy.productIdLabel,
        }}
        onAddToCart={handleAddToCart}
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
