import { postIntegration } from "../api/integrationClient";
import { auth } from "../auth/firebaseClient";
import { INTEGRATION_ROUTES } from "../constants/integrationRoutes";

type UnknownRecord = Record<string, unknown>;

type CartLineItemDraft = {
  Quantity?: string;
  UnitPrice?: string;
};

export type SyncUserResponse = {
  accountId: string;
  contactId: string;
};

export type DecisionResponse = {
  isActiveQuote: boolean;
  isActiveOrder: boolean;
  isActiveAsset: boolean;
  quoteId: string | null;
  quoteStatus: string | null;
  lastSelectedCatalogId: string | null;
  salesTransactionId: string | null;
  hasAnyActive: boolean;
};

export type CreateDefaultQuotePayload = {
  accountId: string;
  contactId: string;
};

export type CreateDefaultQuoteResponse = {
  salesTransactionId: string;
};

export type ProductSummary = {
  id?: string;
  name: string;
  nodeType?: string;
  description?: string;
  imageUrl?: string;
  productCode?: string;
  isActive?: boolean;
  availabilityDate?: string;
  productSpecificationTypeName?: string;
  categories: string[];
  pricebookEntries: ProductPricebookEntry[];
  productSellingModelOptions: ProductSellingModelOptionSummary[];
};

export type ProductPricebookEntry = {
  id?: string;
  product2Id?: string;
  pricebook2Id?: string;
  unitPrice?: number;
  currencyIsoCode?: string;
  productSellingModelId?: string;
  isActive?: boolean;
};

export type ProductSellingModelOptionSummary = {
  id?: string;
  productId?: string;
  pricebookEntryId?: string;
  unitPrice?: number;
  isDefault: boolean;
  model: {
    id?: string;
    name?: string;
    status?: string;
    sellingModelType?: string;
    pricingTermUnit?: string;
    pricingTerm?: number;
    doesAutoRenewByDefault?: boolean;
  };
};

export type ListProductsPayload = {
  cataLogId: string;
  searchProductName: string;
};

export type AddProductInput = {
  Product2Id: string;
  PricebookEntryId: string;
  UnitPrice: string;
  Quantity: string;
  PeriodBoundary?: string;
  BillingFrequency?: string;
};

export type AddProductsToCartPayload = {
  quoteID: string;
  productsToAddList: AddProductInput[];
};

export type EditProductInput = CartLineItemDraft;

export type EditProductsToCartPayload = {
  quoteID: string;
  quoteLineItemID: string;
  productsToAddList: EditProductInput[];
};

export type RemoveProductsFromCartPayload = {
  quoteID: string;
  quoteLineItemID: string;
  productsToAddList: Array<{
    Product2Id: string;
  }>;
};

export type CreateOrderAddressData = {
  billingToName: string;
  billingStreet: string;
  billingCity: string;
  billingState: string;
  billingPostalCode: string;
  billingCountry: string;
  shippingToName: string;
  shippingStreet: string;
  shippingCity: string;
  shippingState: string;
  shippingPostalCode: string;
  shippingCountry: string;
  email: string;
  phone: string;
};

export type CreateOrderFromQuotePayload = {
  quoteId: string;
  addressData: CreateOrderAddressData;
};

export type CreateOrderFromQuoteResult = {
  success: boolean;
  queued: boolean;
  jobId: string | null;
  message: string | null;
};

export type GetOrderStatusPayload = {
  quoteId: string;
};

export type OrderProcessingStatus = "Processing" | "Completed" | "Failed" | "Unknown";

export type GetOrderStatusResult = {
  status: OrderProcessingStatus;
  message: string | null;
};

export type CheckoutAddressDetails = {
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
};

export type CheckoutContactDetails = {
  fullName: string;
  email: string;
  phoneCountryCode: string;
  phoneNumber: string;
};

export type CheckoutBillingDetails = {
  contact: CheckoutContactDetails;
  billingAddress: CheckoutAddressDetails;
  shippingAddress: CheckoutAddressDetails;
};

export type CartLineItem = {
  uiId: string;
  quoteLineItemId: string | null;
  productId: string | null;
  productName: string;
  quantity: number | null;
  unitPrice: number | null;
  lineTotal: number | null;
  billingFrequency: string | null;
  periodBoundary: string | null;
  isChild: boolean;
  parentQuoteLineItemId: string | null;
  depth: number;
};

export type CartTotals = {
  itemCount: number;
  totalAmount: number | null;
  currencyCode: string;
};

export type TotalsComputationMeta = {
  isFallbackComputed: boolean;
};

export type CreateOrderFromQuoteFuturePayload = {
  quoteId: string;
  billing: CheckoutBillingDetails;
  lineItems: CartLineItem[];
  totals: CartTotals;
  totalsComputation: TotalsComputationMeta;
};

export type CartQuote = {
  quoteId: string;
  quoteName: string | null;
  quoteStatus: string | null;
  lineItems: CartLineItem[];
  totals: CartTotals;
  totalsComputation: TotalsComputationMeta;
};

export type CartMutationResult = {
  isSuccess: boolean;
  message: string | null;
};

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null;
}

function asNonEmptyString(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0 ? value : null;
}

function asNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function asNumberLike(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim().length > 0) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function collectCandidateRecords(raw: unknown): UnknownRecord[] {
  if (!isRecord(raw)) {
    return [];
  }

  const candidates: UnknownRecord[] = [raw];
  if (isRecord(raw.data)) {
    candidates.push(raw.data);
    if (isRecord(raw.data.result)) {
      candidates.push(raw.data.result);
    }
  }
  if (isRecord(raw.result)) {
    candidates.push(raw.result);
  }

  return candidates;
}

function findStringField(candidates: UnknownRecord[], key: string): string | null {
  for (const candidate of candidates) {
    const value = asNonEmptyString(candidate[key]);
    if (value) {
      return value;
    }
  }
  return null;
}

function findBooleanField(candidates: UnknownRecord[], key: string): boolean | null {
  for (const candidate of candidates) {
    if (typeof candidate[key] === "boolean") {
      return candidate[key] as boolean;
    }
  }
  return null;
}

function normalizeSyncUserResponse(raw: unknown): SyncUserResponse {
  const candidates = collectCandidateRecords(raw);
  const accountId = findStringField(candidates, "accountId");
  const contactId = findStringField(candidates, "contactId");

  if (!accountId || !contactId) {
    throw new Error("Sync user response is missing required accountId/contactId.");
  }

  return {
    accountId,
    contactId,
  };
}

function normalizeDecisionResponse(raw: unknown): DecisionResponse {
  const candidates = collectCandidateRecords(raw);
  const isActiveQuote = findBooleanField(candidates, "isActiveQuote");
  const isActiveOrder = findBooleanField(candidates, "isActiveOrder");
  const isActiveAsset = findBooleanField(candidates, "isActiveAsset");

  if (isActiveQuote === null || isActiveOrder === null || isActiveAsset === null) {
    throw new Error("Decision response is missing required active-status flags.");
  }

  const quoteId = findStringField(candidates, "quoteId");
  const quoteStatus = findStringField(candidates, "quoteStatus");
  const lastSelectedCatalogId = findStringField(candidates, "lastSelectedCatalogId");
  const salesTransactionId = findStringField(candidates, "salesTransactionId");

  return {
    isActiveQuote,
    isActiveOrder,
    isActiveAsset,
    quoteId,
    quoteStatus,
    lastSelectedCatalogId,
    salesTransactionId,
    hasAnyActive: isActiveQuote || isActiveOrder || isActiveAsset,
  };
}

function normalizeCreateDefaultQuoteResponse(raw: unknown): CreateDefaultQuoteResponse {
  const candidates = collectCandidateRecords(raw);
  const isSuccess = findBooleanField(candidates, "isSuccess");
  const salesTransactionId = findStringField(candidates, "salesTransactionId");

  if (isSuccess !== true || !salesTransactionId) {
    throw new Error("Create default quote response is missing success or salesTransactionId.");
  }

  return {
    salesTransactionId,
  };
}

function toProductSummary(value: unknown): ProductSummary | null {
  if (!isRecord(value)) {
    return null;
  }

  const name = asNonEmptyString(value.name);
  if (!name) {
    return null;
  }

  const id = asNonEmptyString(value.id) ?? undefined;
  const imageUrl = asNonEmptyString(value.imageUrl) ?? undefined;
  const productCode = asNonEmptyString(value.productCode) ?? undefined;
  const isActive = typeof value.isActive === "boolean" ? value.isActive : undefined;
  const availabilityDate = asNonEmptyString(value.availabilityDate) ?? undefined;
  const productSpecificationTypeName = isRecord(value.productSpecificationType)
    ? asNonEmptyString(value.productSpecificationType.name) ?? undefined
    : undefined;
  const categories = Array.isArray(value.categories)
    ? value.categories
        .map((category) => (isRecord(category) ? asNonEmptyString(category.name) : null))
        .filter((categoryName): categoryName is string => Boolean(categoryName))
    : [];
  const pricebookEntries = Array.isArray(value.pricebookEntries)
    ? value.pricebookEntries
        .filter((entry): entry is UnknownRecord => isRecord(entry))
        .map((entry) => ({
          id: asNonEmptyString(entry.id) ?? undefined,
          product2Id: asNonEmptyString(entry.product2Id) ?? undefined,
          pricebook2Id: asNonEmptyString(entry.pricebook2Id) ?? undefined,
          unitPrice: asNumberLike(entry.unitPrice) ?? undefined,
          currencyIsoCode: asNonEmptyString(entry.currencyIsoCode) ?? undefined,
          productSellingModelId: asNonEmptyString(entry.productSellingModelId) ?? undefined,
          isActive: typeof entry.isActive === "boolean" ? entry.isActive : undefined,
        }))
    : [];
  const productSellingModelOptions = Array.isArray(value.productSellingModelOptions)
    ? value.productSellingModelOptions
        .map((option) => {
          if (!isRecord(option)) {
            return null;
          }

          const model = isRecord(option.productSellingModel) ? option.productSellingModel : {};
          const modelId = asNonEmptyString(model.id) ?? undefined;
          const matchedPricebookEntry = pricebookEntries.find((entry) => modelId && entry.productSellingModelId === modelId);
          return {
            id: asNonEmptyString(option.id) ?? undefined,
            // ProductSummary.id is the canonical Product2Id for this endpoint.
            productId: id ?? asNonEmptyString(option.productId) ?? undefined,
            pricebookEntryId: asNonEmptyString(option.pricebookEntryId) ?? matchedPricebookEntry?.id ?? undefined,
            unitPrice: asNumberLike(option.unitPrice) ?? matchedPricebookEntry?.unitPrice ?? undefined,
            isDefault: option.isDefault === true,
            model: {
              id: modelId,
              name: asNonEmptyString(model.name) ?? undefined,
              status: asNonEmptyString(model.status) ?? undefined,
              sellingModelType: asNonEmptyString(model.sellingModelType) ?? undefined,
              pricingTermUnit: asNonEmptyString(model.pricingTermUnit) ?? undefined,
              pricingTerm: asNumber(model.pricingTerm) ?? undefined,
              doesAutoRenewByDefault:
                typeof model.doesAutoRenewByDefault === "boolean" ? model.doesAutoRenewByDefault : undefined,
            },
          } as ProductSellingModelOptionSummary;
        })
        .filter((option): option is ProductSellingModelOptionSummary => Boolean(option))
    : [];

  return {
    id,
    name,
    nodeType: asNonEmptyString(value.nodeType) ?? undefined,
    description: asNonEmptyString(value.description) ?? undefined,
    imageUrl,
    productCode,
    isActive,
    availabilityDate,
    productSpecificationTypeName,
    categories,
    pricebookEntries,
    productSellingModelOptions,
  };
}

function normalizeListProductsResponse(raw: unknown): ProductSummary[] {
  const candidates = collectCandidateRecords(raw);

  for (const candidate of candidates) {
    const productsContainer = isRecord(candidate.listProductsResponse)
      ? candidate.listProductsResponse
      : candidate;
    const products = productsContainer.products;
    if (!Array.isArray(products)) {
      continue;
    }

    return products
      .map((product) => toProductSummary(product))
      .filter((product): product is ProductSummary => Boolean(product));
  }

  throw new Error("List products response is missing a valid products array.");
}

function extractLineItems(candidates: UnknownRecord[]): unknown[] {
  const possibleKeys = ["quoteLines", "quoteLineItems", "quoteLineList", "lineItems", "items", "records"];

  for (const candidate of candidates) {
    for (const key of possibleKeys) {
      if (Array.isArray(candidate[key])) {
        return candidate[key] as unknown[];
      }
    }

    const quote = isRecord(candidate.quote) ? candidate.quote : null;
    if (quote) {
      for (const key of possibleKeys) {
        if (Array.isArray(quote[key])) {
          return quote[key] as unknown[];
        }
      }
    }
  }

  return [];
}

function collectNestedRecords(value: unknown, maxDepth = 5): UnknownRecord[] {
  const records: UnknownRecord[] = [];

  function visit(node: unknown, depth: number): void {
    if (depth > maxDepth) {
      return;
    }

    if (Array.isArray(node)) {
      for (const item of node) {
        visit(item, depth + 1);
      }
      return;
    }

    if (!isRecord(node)) {
      return;
    }

    records.push(node);
    for (const nestedValue of Object.values(node)) {
      visit(nestedValue, depth + 1);
    }
  }

  visit(value, 0);
  return records;
}

function findLikelyLineItems(raw: unknown): unknown[] {
  const nestedRecords = collectNestedRecords(raw);
  const candidateArrays: unknown[][] = [];

  for (const record of nestedRecords) {
    for (const [key, value] of Object.entries(record)) {
      if (!Array.isArray(value) || value.length === 0) {
        continue;
      }

      const normalizedKey = key.toLowerCase();
      if (
        normalizedKey.includes("quoteline")
        || normalizedKey.includes("lineitem")
        || normalizedKey === "items"
        || normalizedKey === "records"
      ) {
        candidateArrays.push(value);
      }
    }
  }

  if (candidateArrays.length > 0) {
    candidateArrays.sort((a, b) => b.length - a.length);
    return candidateArrays[0];
  }

  return [];
}

function readFromRecord(record: UnknownRecord, keys: string[]): unknown {
  for (const key of keys) {
    if (key in record) {
      return record[key];
    }
  }

  return undefined;
}

function toCartLineItem(
  value: unknown,
  index: number,
  options: { depth: number; parentQuoteLineItemId: string | null }
): CartLineItem | null {
  if (!isRecord(value)) {
    return null;
  }

  const quoteLineItemId = asNonEmptyString(
    readFromRecord(value, [
      "quoteLineItemID",
      "quoteLineItemId",
      "quoteLineId",
      "quoteLineID",
      "QuoteLineId",
      "QuoteLineID",
      "id",
      "Id",
    ])
  ) ?? asNonEmptyString(readFromRecord(value, ["QuoteLineItemId", "QuoteLineItemID"]));

  const productRecord =
    (isRecord(value.product) ? value.product : null) ||
    (isRecord(value.product2) ? value.product2 : null) ||
    (isRecord(value.Product2) ? value.Product2 : null);
  const pricebookEntryRecord =
    (isRecord(value.pricebookEntry) ? value.pricebookEntry : null) ||
    (isRecord(value.PricebookEntry) ? value.PricebookEntry : null);

  const productId =
    asNonEmptyString(readFromRecord(value, ["productId", "product2Id", "product2ID", "Product2Id", "Product2ID"])) ||
    (productRecord ? asNonEmptyString(readFromRecord(productRecord, ["id", "Id", "productId", "Product2Id"])) : null) ||
    (pricebookEntryRecord
      ? asNonEmptyString(readFromRecord(pricebookEntryRecord, ["product2Id", "Product2Id", "Product2ID"]))
      : null);

  const productName =
    asNonEmptyString(readFromRecord(value, ["productName", "Name", "name"])) ||
    (productRecord
      ? asNonEmptyString(readFromRecord(productRecord, ["name", "Name"]))
      : null) ||
    "Unnamed product";

  const quantity = asNumberLike(readFromRecord(value, ["quantity", "Quantity"]));
  const unitPrice = asNumberLike(readFromRecord(value, ["unitPrice", "UnitPrice"]));
  const mappedLineTotal = asNumberLike(
    readFromRecord(value, ["lineTotal", "lineItemSubTotal", "totalPrice", "TotalPrice", "netAmount"])
  );
  const lineTotal = mappedLineTotal ?? (quantity !== null && unitPrice !== null ? quantity * unitPrice : null);

  // Keep UI identity separate from backend mutation identity so rows without server ids remain renderable.
  const uiId =
    quoteLineItemId ??
    `${options.parentQuoteLineItemId ?? "line"}-${options.depth}-${index}-${productId ?? "line"}-${productName}`
      .toLowerCase()
      .replace(/\s+/g, "-");

  return {
    uiId,
    quoteLineItemId,
    productId,
    productName,
    quantity,
    unitPrice,
    lineTotal,
    billingFrequency: asNonEmptyString(readFromRecord(value, ["billingFrequency", "BillingFrequency"])),
    periodBoundary: asNonEmptyString(readFromRecord(value, ["periodBoundary", "PeriodBoundary"])),
    isChild: options.depth > 0,
    parentQuoteLineItemId: options.parentQuoteLineItemId,
    depth: options.depth,
  };
}

function toCartLineItems(
  values: unknown[],
  options: { depth: number; parentQuoteLineItemId: string | null }
): CartLineItem[] {
  const lineItems: CartLineItem[] = [];

  values.forEach((value, index) => {
    const line = toCartLineItem(value, index, options);
    if (!line) {
      return;
    }

    lineItems.push(line);

    if (!isRecord(value) || !Array.isArray(value.childItems) || value.childItems.length === 0) {
      return;
    }

    lineItems.push(
      ...toCartLineItems(value.childItems, {
        depth: options.depth + 1,
        parentQuoteLineItemId: line.quoteLineItemId,
      })
    );
  });

  return lineItems;
}

function normalizeCartQuote(raw: unknown): CartQuote {
  const candidates = collectCandidateRecords(raw);
  const quoteId =
    findStringField(candidates, "quoteId") ||
    findStringField(candidates, "quoteID") ||
    findStringField(candidates, "id") ||
    findStringField(candidates, "quoteNumber");
  const quoteName =
    findStringField(candidates, "quoteName") ||
    findStringField(candidates, "name") ||
    findStringField(candidates, "quoteNumber");

  const extractedLineItems = extractLineItems(candidates);
  const lineItemSource = extractedLineItems.length > 0 ? extractedLineItems : findLikelyLineItems(raw);
  const lineItems = toCartLineItems(lineItemSource, {
    depth: 0,
    parentQuoteLineItemId: null,
  });

  const summaryLineItems = lineItems.filter((item) => !item.isChild);

  const computedTotal = summaryLineItems.reduce((sum, item) => {
    if (item.quantity === null || item.unitPrice === null) {
      return sum;
    }

    return sum + item.quantity * item.unitPrice;
  }, 0);

  const itemCount = summaryLineItems.reduce((sum, item) => {
    if (item.quantity !== null && item.quantity > 0) {
      return sum + item.quantity;
    }
    return sum + 1;
  }, 0);

  return {
    quoteId: quoteId ?? "",
    quoteName,
    quoteStatus: findStringField(candidates, "quoteStatus") || findStringField(candidates, "status"),
    lineItems,
    totals: {
      itemCount,
      totalAmount: computedTotal,
      currencyCode: findStringField(candidates, "currencyCode") ?? "USD",
    },
    totalsComputation: {
      isFallbackComputed: false,
    },
  };
}

function normalizeCartMutationResult(raw: unknown): CartMutationResult {
  const candidates = collectCandidateRecords(raw);
  // TEMPORARY (accepted risk): Some current integration responses omit `isSuccess`
  // on successful HTTP 200 mutations, so we default to true for now.
  const isSuccess = findBooleanField(candidates, "isSuccess") ?? true;
  const message =
    findStringField(candidates, "message") ||
    findStringField(candidates, "statusMessage") ||
    findStringField(candidates, "error");

  return {
    isSuccess,
    message,
  };
}

function normalizeCreateOrderFromQuoteResult(raw: unknown): CreateOrderFromQuoteResult {
  const candidates = collectCandidateRecords(raw);
  const success = findBooleanField(candidates, "success") ?? findBooleanField(candidates, "isSuccess") ?? false;
  const queued = findBooleanField(candidates, "queued") ?? false;
  const jobId = findStringField(candidates, "jobId");
  const message =
    findStringField(candidates, "message")
    || findStringField(candidates, "statusMessage")
    || findStringField(candidates, "error");

  return {
    success,
    queued,
    jobId,
    message,
  };
}

function normalizeOrderProcessingStatus(value: string | null): OrderProcessingStatus {
  const normalizedValue = value?.trim().toLowerCase();

  if (normalizedValue === "processing") {
    return "Processing";
  }
  if (normalizedValue === "completed") {
    return "Completed";
  }
  if (normalizedValue === "failed") {
    return "Failed";
  }
  return "Unknown";
}

function normalizeGetOrderStatusResult(raw: unknown): GetOrderStatusResult {
  const candidates = collectCandidateRecords(raw);
  const normalizedStatus = normalizeOrderProcessingStatus(
    findStringField(candidates, "status") || findStringField(candidates, "orderStatus")
  );
  const message =
    findStringField(candidates, "message")
    || findStringField(candidates, "statusMessage")
    || findStringField(candidates, "error");

  return {
    status: normalizedStatus,
    message,
  };
}

export async function callIntegration<T, P = unknown>(
  endpoint: string,
  payload: P
): Promise<T> {
  const user = auth.currentUser;

  if (!user) {
    throw new Error("User not authenticated");
  }

  const token = await user.getIdToken();
  return postIntegration<T, P>(endpoint, payload, token);
}

export async function syncUser(payload: Record<string, unknown>): Promise<SyncUserResponse> {
  const response = await callIntegration<unknown, Record<string, unknown>>(INTEGRATION_ROUTES.syncUser, payload);
  return normalizeSyncUserResponse(response);
}

export async function evaluateDecision(): Promise<DecisionResponse> {
  const currentUid = auth.currentUser?.uid;
  if (!currentUid) {
    throw new Error("User not authenticated");
  }

  const response = await callIntegration<unknown, { uId: string }>(
    INTEGRATION_ROUTES.decisionApi,
    { uId: currentUid }
  );
  return normalizeDecisionResponse(response);
}

export async function createDefaultQuote(
  payload: CreateDefaultQuotePayload
): Promise<CreateDefaultQuoteResponse> {
  const response = await callIntegration<unknown, CreateDefaultQuotePayload>(
    INTEGRATION_ROUTES.createDefaultQuote,
    payload
  );
  return normalizeCreateDefaultQuoteResponse(response);
}

export async function listProducts(
  payload: ListProductsPayload
): Promise<ProductSummary[]> {
  const response = await callIntegration<unknown, ListProductsPayload>(
    INTEGRATION_ROUTES.listProducts,
    payload
  );
  return normalizeListProductsResponse(response);
}

export async function getQuotesWithQuoteLines(payload: { quoteId: string }): Promise<CartQuote> {
  const response = await callIntegration<unknown, { quoteId: string }>(
    INTEGRATION_ROUTES.getQuotesWithQuoteLines,
    payload
  );
  return normalizeCartQuote(response);
}

export async function addProductsToCart(payload: AddProductsToCartPayload): Promise<CartMutationResult> {
  const response = await callIntegration<unknown, AddProductsToCartPayload>(
    INTEGRATION_ROUTES.addProductsToCart,
    payload
  );
  return normalizeCartMutationResult(response);
}

export async function editProductsToCart(payload: EditProductsToCartPayload): Promise<CartMutationResult> {
  const response = await callIntegration<unknown, EditProductsToCartPayload>(
    INTEGRATION_ROUTES.editProductsToCart,
    payload
  );
  return normalizeCartMutationResult(response);
}

export async function removeProductsToCart(payload: RemoveProductsFromCartPayload): Promise<CartMutationResult> {
  const response = await callIntegration<unknown, RemoveProductsFromCartPayload>(
    INTEGRATION_ROUTES.removeProductsToCart,
    payload
  );
  return normalizeCartMutationResult(response);
}

export async function createOrdersFromQuote(payload: CreateOrderFromQuotePayload): Promise<CreateOrderFromQuoteResult> {
  const response = await callIntegration<unknown, CreateOrderFromQuotePayload>(
    INTEGRATION_ROUTES.createOrdersFromQuote,
    payload
  );
  return normalizeCreateOrderFromQuoteResult(response);
}

export async function getOrderStatus(payload: GetOrderStatusPayload): Promise<GetOrderStatusResult> {
  const response = await callIntegration<unknown, GetOrderStatusPayload>(
    INTEGRATION_ROUTES.getOrderStatus,
    payload
  );
  return normalizeGetOrderStatusResult(response);
}
