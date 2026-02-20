export const INTEGRATION_ROUTES = {
  syncUser: "/api/sync-user",
  listCatalogs: "/api/listCatalogs",
  listProducts: "/api/listProducts",
  getProductDetails: "/api/getProductDetails",
  getQuotesWithQuoteLines: "/api/getQuotesWithQuoteLines",
  addProductsToCart: "/api/addProductsToCart",
  editProductsToCart: "/api/editProductsToCart",
  removeProductsToCart: "/api/removeProductsToCart",
  createOrdersFromQuote: "/api/createOrdersFromQuote",
  createDefaultQuote: "/api/createDefaultQuote",
  decisionApi: "/api/decisionapi",
} as const;
