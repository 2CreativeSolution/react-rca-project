import TuneOutlinedIcon from "@mui/icons-material/TuneOutlined";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import { Button, CircularProgress, FormControl, InputLabel, MenuItem, Paper, Select, Stack, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import FilterToolbar from "../components/filters/FilterToolbar";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import ProductDetailsDialog from "../components/product/ProductDetailsDialog";
import ProductList from "../components/product/ProductList";
import { catalogGlassSurfaceSx } from "../components/catalog/styles";
import { APP_EVENTS } from "../constants/appEvents";
import { PRODUCT_COPY } from "../constants/productContent";
import { ROUTES } from "../constants/routes";
import { useAuth } from "../context/useAuth";
import { useNotification } from "../context/useNotification";
import { getCatalogOptions, type CatalogOption } from "../services/catalog/catalogService";
import { addProductsToCart, getProductDetails, listProducts, type ProductDetails, type ProductSummary } from "../services/salesforceApi";

const UNCATEGORIZED_FILTER_VALUE = "__filter_uncategorized__";

type ProductLandingRouteState = {
  fromCatalog?: boolean;
};

export default function ProductLanding() {
  const productLandingCopy = PRODUCT_COPY.landing;
  const [catalogOptions, setCatalogOptions] = useState<CatalogOption[]>([]);
  const [selectedCatalogId, setSelectedCatalogId] = useState("");
  const [products, setProducts] = useState<ProductSummary[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedProductSummary, setSelectedProductSummary] = useState<ProductSummary | null>(null);
  const [selectedProductDetails, setSelectedProductDetails] = useState<ProductDetails | null>(null);
  const [isProductDetailsLoading, setIsProductDetailsLoading] = useState(false);
  const [productDetailsError, setProductDetailsError] = useState<string | null>(null);
  const [addToCartProductId, setAddToCartProductId] = useState<string | null>(null);
  const [isCatalogLoading, setIsCatalogLoading] = useState(true);
  const [isProductsLoading, setIsProductsLoading] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const selectedCatalogParam = searchParams.get("catalogId")?.trim() ?? "";
  const initialCatalogParamRef = useRef(selectedCatalogParam);
  const productDetailsRequestIdRef = useRef(0);
  const { decisionSession } = useAuth();
  const { notifyError, notifySuccess, notifyWarning } = useNotification();
  const showCatalogBackButton = (location.state as ProductLandingRouteState | null)?.fromCatalog === true;

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
    setSelectedProductSummary(null);
    setSelectedProductDetails(null);
    setProductDetailsError(null);
    setIsProductDetailsLoading(false);
    productDetailsRequestIdRef.current += 1;

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
        window.dispatchEvent(new Event(APP_EVENTS.cartUpdated));
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

  const handleBackToCatalog = useCallback(() => {
    const nextSearchParams = new URLSearchParams();
    const resolvedCatalogId = selectedCatalogId || selectedCatalogParam;
    if (resolvedCatalogId) {
      nextSearchParams.set("catalogId", resolvedCatalogId);
    }

    navigate({
      pathname: ROUTES.catalog,
      search: nextSearchParams.toString() ? `?${nextSearchParams.toString()}` : "",
    });
  }, [navigate, selectedCatalogId, selectedCatalogParam]);

  const handleCloseProductDetails = useCallback(() => {
    productDetailsRequestIdRef.current += 1;
    setSelectedProductSummary(null);
    setSelectedProductDetails(null);
    setIsProductDetailsLoading(false);
    setProductDetailsError(null);
  }, []);

  const handleSelectProduct = useCallback(
    (product: ProductSummary) => {
      setSelectedProductSummary(product);
      setSelectedProductDetails(null);
      setProductDetailsError(null);

      const productId = product.id?.trim();
      if (!productId) {
        // TODO: Invalidate any in-flight product-details request here before returning
        // to avoid stale responses updating dialog state after a no-id selection.
        setIsProductDetailsLoading(false);
        setProductDetailsError(productLandingCopy.productDetailsUnavailableMessage);
        return;
      }

      const requestId = productDetailsRequestIdRef.current + 1;
      productDetailsRequestIdRef.current = requestId;
      setIsProductDetailsLoading(true);

      void (async () => {
        try {
          const details = await getProductDetails({ productId });
          if (productDetailsRequestIdRef.current !== requestId) {
            return;
          }
          setSelectedProductDetails(details);
        } catch (error) {
          if (productDetailsRequestIdRef.current !== requestId) {
            return;
          }
          const message =
            error instanceof Error && error.message.trim().length > 0
              ? error.message
              : productLandingCopy.productDetailsLoadErrorMessage;
          setProductDetailsError(message);
        } finally {
          if (productDetailsRequestIdRef.current === requestId) {
            setIsProductDetailsLoading(false);
          }
        }
      })();
    },
    [productLandingCopy.productDetailsLoadErrorMessage, productLandingCopy.productDetailsUnavailableMessage]
  );

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
      <Stack
        direction="row"
        alignItems="flex-start"
        justifyContent="space-between"
        spacing={1.5}
        sx={{ flexWrap: "wrap" }}
      >
        <Stack spacing={0.8} alignItems="flex-start">
          {showCatalogBackButton ? (
            <Button
              variant="outlined"
              size="small"
              startIcon={<ArrowBackRoundedIcon fontSize="small" />}
              onClick={handleBackToCatalog}
            >
              {productLandingCopy.backToCatalogLabel}
            </Button>
          ) : null}
          <Typography variant="h4">{productLandingCopy.title}</Typography>
        </Stack>
        <Stack
          direction="row"
          alignItems="center"
          spacing={0.8}
          sx={(theme) => ({
            px: 1.6,
            py: 0.85,
            borderRadius: 2,
            border: "1px solid",
            borderColor: alpha(theme.palette.primary.main, 0.34),
            backgroundColor: alpha(theme.palette.primary.light, 0.12),
            boxShadow: `0 2px 10px ${alpha(theme.palette.primary.dark, 0.08)}`,
          })}
        >
          <Typography color="text.secondary" variant="body2" sx={{ fontWeight: 600 }}>
            {productLandingCopy.resultCountLabel}
          </Typography>
          <Typography
            variant="h6"
            sx={(theme) => ({
              fontWeight: 800,
              lineHeight: 1,
              color: theme.palette.primary.dark,
            })}
          >
            {filteredProducts.length}
          </Typography>
        </Stack>
      </Stack>
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
          bundleProductLabel: productLandingCopy.bundleProductLabel,
          emptyCatalogMessage: productLandingCopy.emptyCatalogMessage,
          emptyMessage: hasActiveProductFilters ? productLandingCopy.emptyFilteredMessage : productLandingCopy.emptyMessage,
          loadingMessage: productLandingCopy.loadingMessage,
          notAvailableLabel: productLandingCopy.notAvailableLabel,
          priceLabel: productLandingCopy.priceLabel,
        }}
        onAddToCart={handleAddToCart}
        onSelectProduct={handleSelectProduct}
        products={filteredProducts}
      />

      <ProductDetailsDialog
        labels={{
          activeLabel: productLandingCopy.activeLabel,
          autoRenewLabel: productLandingCopy.autoRenewLabel,
          availabilityLabel: productLandingCopy.availabilityLabel,
          categoryLabel: productLandingCopy.categoryLabel,
          defaultValueLabel: productLandingCopy.defaultValueLabel,
          closeDetailsAriaLabel: productLandingCopy.closeDetailsAriaLabel,
          defaultOptionLabel: productLandingCopy.defaultOptionLabel,
          detailsTitleFallback: productLandingCopy.detailsTitleFallback,
          descriptionTitle: productLandingCopy.descriptionTitle,
          descriptionUnavailableLabel: productLandingCopy.descriptionUnavailableLabel,
          imageGalleryTitle: productLandingCopy.imageGalleryTitle,
          imageThumbnailAriaLabel: productLandingCopy.imageThumbnailAriaLabel,
          inactiveLabel: productLandingCopy.inactiveLabel,
          modelStatusLabel: productLandingCopy.modelStatusLabel,
          modelTypeLabel: productLandingCopy.modelTypeLabel,
          noAttributesMessage: productLandingCopy.noAttributesMessage,
          noLabel: productLandingCopy.noLabel,
          notAvailableLabel: productLandingCopy.notAvailableLabel,
          noSellingModelMessage: productLandingCopy.noSellingModelMessage,
          attributesTitle: productLandingCopy.attributesTitle,
          attributeLabelLabel: productLandingCopy.attributeLabelLabel,
          nodeTypeLabel: productLandingCopy.nodeTypeLabel,
          pricingTermLabel: productLandingCopy.pricingTermLabel,
          pricingTermUnitLabel: productLandingCopy.pricingTermUnitLabel,
          sellingModelsTitle: productLandingCopy.sellingModelsTitle,
          statusLabel: productLandingCopy.statusLabel,
          yesLabel: productLandingCopy.yesLabel,
        }}
        errorMessage={productDetailsError}
        isLoading={isProductDetailsLoading}
        onClose={handleCloseProductDetails}
        productDetails={selectedProductDetails}
        productSummary={selectedProductSummary}
      />
    </Stack>
  );
}
