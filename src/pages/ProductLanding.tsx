import { CircularProgress, FormControl, InputLabel, MenuItem, Paper, Select, Stack, Typography } from "@mui/material";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ProductDetailsDialog from "../components/product/ProductDetailsDialog";
import ProductList from "../components/product/ProductList";
import { PRODUCT_COPY } from "../constants/productContent";
import { ROUTES } from "../constants/routes";
import { useNotification } from "../context/useNotification";
import { getCatalogOptions, type CatalogOption } from "../services/catalog/catalogService";
import { listProducts, type ProductSummary } from "../services/salesforceApi";

export default function ProductLanding() {
  const productLandingCopy = PRODUCT_COPY.landing;
  const [catalogOptions, setCatalogOptions] = useState<CatalogOption[]>([]);
  const [selectedCatalogId, setSelectedCatalogId] = useState("");
  const [products, setProducts] = useState<ProductSummary[]>([]);
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

      <ProductList
        catalogOptionsCount={catalogOptions.length}
        isProductsLoading={isProductsLoading}
        labels={{
          addToCartCtaLabel: productLandingCopy.addToCartCtaLabel,
          availabilityLabel: productLandingCopy.availabilityLabel,
          emptyCatalogMessage: productLandingCopy.emptyCatalogMessage,
          emptyMessage: productLandingCopy.emptyMessage,
          loadingMessage: productLandingCopy.loadingMessage,
          notAvailableLabel: productLandingCopy.notAvailableLabel,
          productCodeLabel: productLandingCopy.productCodeLabel,
          productIdLabel: productLandingCopy.productIdLabel,
        }}
        onAddToCart={() => navigate(ROUTES.cart)}
        onSelectProduct={setSelectedProduct}
        products={products}
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
