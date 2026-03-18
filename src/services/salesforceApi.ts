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

export type GetProductDetailsPayload = {
  productId: string;
};

export type ProductDetailsAttribute = {
  code?: string;
  label?: string;
  defaultValue?: string;
  status?: string;
};

export type ProductDetailsAttributeCategory = {
  id?: string;
  code?: string;
  name?: string;
  attributes: ProductDetailsAttribute[];
};

export type ProductDetailsChildItem = {
  id?: string;
  name: string;
  description?: string;
  quantity?: number;
  children: ProductDetailsChildItem[];
};

export type ProductDetails = ProductSummary & {
  imageUrls: string[];
  attributeCategories: ProductDetailsAttributeCategory[];
  childItems: ProductDetailsChildItem[];
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

export type GetDashboardDataPayload = {
  accountId: string;
};

export type DashboardSummary = {
  activeOrders: number;
  pastOrders: number;
  totalAssets: number;
  totalQuotes: number;
  totalRevenue: number;
};

export type DashboardOrderFulfillment = {
  steps: DashboardOrderFulfillmentStep[];
  completedSteps: number | null;
  failedSteps: number | null;
  hasFallout: boolean | null;
  inProgressSteps: number | null;
  planAgeHours: number | null;
  planState: string | null;
  priority: string | null;
  progressPercent: number | null;
  sourceType: string | null;
  state: string | null;
  totalSteps: number | null;
};

export type DashboardOrderFulfillmentStep = {
  id: string | null;
  name: string | null;
  state: string | null;
  stepType: string | null;
  jeopardyStatus: string | null;
  plannedCompletionDate: string | null;
  actualStartDate: string | null;
  actualCompletionDate: string | null;
  retryAttempts: number | null;
  executionMessage: string | null;
  isVisibleByExternalUsers: boolean | null;
  falloutQueueId: string | null;
};

export type DashboardOrder = {
  activationProgressPercent: number | null;
  activationTime: string | null;
  amount: number | null;
  effectiveDate: string | null;
  fulfillment: DashboardOrderFulfillment | null;
  hoursRemaining: number | null;
  isActivationEligible: boolean | null;
  isActivationPending: boolean | null;
  millisecondsRemaining: number | null;
  minutesRemaining: number | null;
  notes: string | null;
  orderId: string;
  status: string | null;
};

export type DashboardAsset = {
  assetId: string;
  name: string | null;
  productFamily: string | null;
  status: string | null;
};

export type DashboardQuote = {
  name: string | null;
  notes: string | null;
  quoteId: string;
  status: string | null;
  totalAmount: number | null;
};

export type DashboardInsight = {
  message: string | null;
  priority: string | null;
  type: string | null;
};

export type DashboardSnapshot = {
  userId: string | null;
  summary: DashboardSummary;
  activeOrders: DashboardOrder[];
  inProgressOrders: DashboardOrder[];
  pastOrders: DashboardOrder[];
  quotes: DashboardQuote[];
  assets: DashboardAsset[];
  aiInsights: DashboardInsight[];
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

function asBooleanOrNull(value: unknown): boolean | null {
  return typeof value === "boolean" ? value : null;
}

function toDashboardFulfillmentStep(value: unknown): DashboardOrderFulfillmentStep | null {
  if (!isRecord(value)) {
    return null;
  }

  return {
    id: asNonEmptyString(value.id),
    name: asNonEmptyString(value.name),
    state: asNonEmptyString(value.state),
    stepType: asNonEmptyString(value.stepType),
    jeopardyStatus: asNonEmptyString(value.jeopardyStatus),
    plannedCompletionDate: asNonEmptyString(value.plannedCompletionDate),
    actualStartDate: asNonEmptyString(value.actualStartDate),
    actualCompletionDate: asNonEmptyString(value.actualCompletionDate),
    retryAttempts: asNumberLike(value.retryAttempts),
    executionMessage: asNonEmptyString(value.executionMessage),
    isVisibleByExternalUsers: asBooleanOrNull(value.isVisibleByExternalUsers),
    falloutQueueId: asNonEmptyString(value.falloutQueueId),
  };
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

function readImageUrl(value: unknown): string | null {
  if (typeof value === "string") {
    return asNonEmptyString(value);
  }

  if (!isRecord(value)) {
    return null;
  }

  return asNonEmptyString(value.url)
    ?? asNonEmptyString(value.imageUrl)
    ?? asNonEmptyString(value.secureUrl)
    ?? asNonEmptyString(value.src)
    ?? asNonEmptyString(value.path);
}

function toProductImageUrls(value: unknown, fallbackImageUrl?: string): string[] {
  if (!isRecord(value)) {
    return fallbackImageUrl ? [fallbackImageUrl] : [];
  }

  const urls: string[] = [];
  const add = (candidate: string | null): void => {
    if (!candidate || urls.includes(candidate)) {
      return;
    }
    urls.push(candidate);
  };

  add(asNonEmptyString(value.imageUrl));
  add(asNonEmptyString(value.defaultImageUrl));
  add(asNonEmptyString(value.thumbnailUrl));

  if (Array.isArray(value.imageUrls)) {
    value.imageUrls.forEach((entry) => add(readImageUrl(entry)));
  }

  if (Array.isArray(value.images)) {
    value.images.forEach((entry) => add(readImageUrl(entry)));
  }

  add(fallbackImageUrl ?? null);
  return urls;
}

function toProductAttributeCategories(value: unknown): ProductDetailsAttributeCategory[] {
  if (!isRecord(value)) {
    return [];
  }

  const source = Array.isArray(value.attributeCategory)
    ? value.attributeCategory
    : Array.isArray(value.attributeCategories)
      ? value.attributeCategories
      : [];

  return source
    .filter((category): category is UnknownRecord => isRecord(category))
    .map((category) => {
      const attributes = Array.isArray(category.attributes)
        ? category.attributes
            .filter((attribute): attribute is UnknownRecord => isRecord(attribute))
            .map((attribute) => ({
              code: asNonEmptyString(attribute.code) ?? undefined,
              label: asNonEmptyString(attribute.label) ?? asNonEmptyString(attribute.name) ?? undefined,
              defaultValue: asNonEmptyString(attribute.defaultValue) ?? undefined,
              status: asNonEmptyString(attribute.status) ?? undefined,
            }))
        : [];

      return {
        id: asNonEmptyString(category.id) ?? undefined,
        code: asNonEmptyString(category.code) ?? undefined,
        name: asNonEmptyString(category.name) ?? undefined,
        attributes,
      };
    });
}

function dedupeChildItems(items: ProductDetailsChildItem[]): ProductDetailsChildItem[] {
  const seenKeys = new Set<string>();
  const deduped: ProductDetailsChildItem[] = [];

  items.forEach((item) => {
    // TODO: Revisit dedupe strategy when backend payload guarantees stable IDs.
    // For now we intentionally dedupe unnamed-ID entries by normalized name to reduce duplicate UI rows.
    const key = `${item.id ?? "na"}::${item.name.toLowerCase()}`;
    if (seenKeys.has(key)) {
      return;
    }
    seenKeys.add(key);
    deduped.push(item);
  });

  return deduped;
}

function toChildItemsFromChildProducts(value: unknown): ProductDetailsChildItem[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((entry) => {
      if (!isRecord(entry)) {
        return null;
      }

      const name = asNonEmptyString(entry.name);
      if (!name) {
        return null;
      }

      return {
        id: asNonEmptyString(entry.id) ?? undefined,
        name,
        description: asNonEmptyString(entry.description) ?? undefined,
        quantity: asNumberLike(entry.quantity) ?? undefined,
        children: toChildItemsFromChildProducts(entry.childProducts),
      } as ProductDetailsChildItem;
    })
    .filter((item): item is ProductDetailsChildItem => Boolean(item));
}

function toChildItemsFromProductComponentGroups(value: unknown): ProductDetailsChildItem[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const items: ProductDetailsChildItem[] = [];

  value.forEach((group) => {
    if (!isRecord(group)) {
      return;
    }

    const components = Array.isArray(group.components) ? group.components : [];
    components.forEach((component) => {
      if (!isRecord(component)) {
        return;
      }

      const name = asNonEmptyString(component.name);
      if (!name) {
        return;
      }

      const related = isRecord(component.productRelatedComponent) ? component.productRelatedComponent : null;
      const nestedFromGroups = toChildItemsFromProductComponentGroups(component.productComponentGroups);
      const nestedFromChildProducts = toChildItemsFromChildProducts(component.childProducts);
      const children = dedupeChildItems([...nestedFromGroups, ...nestedFromChildProducts]);

      items.push({
        id:
          asNonEmptyString(component.id)
          ?? (related ? asNonEmptyString(related.childProductId) : null)
          ?? undefined,
        name,
        description: asNonEmptyString(component.description) ?? undefined,
        quantity:
          (related ? asNumberLike(related.quantity) : null)
          ?? asNumberLike(component.quantity)
          ?? undefined,
        children,
      });
    });

    const nestedGroups = toChildItemsFromProductComponentGroups(group.childGroups);
    items.push(...nestedGroups);
  });

  return dedupeChildItems(items);
}

function toProductDetails(value: unknown): ProductDetails | null {
  const summary = toProductSummary(value);
  if (!summary || !isRecord(value)) {
    return null;
  }

  const imageUrls = toProductImageUrls(value, summary.imageUrl);
  const childItemsFromComponents = toChildItemsFromProductComponentGroups(value.productComponentGroups);
  const fallbackChildItems = toChildItemsFromChildProducts(value.childProducts);
  const childItems = childItemsFromComponents.length > 0 ? childItemsFromComponents : fallbackChildItems;

  return {
    ...summary,
    imageUrl: imageUrls[0] ?? summary.imageUrl,
    imageUrls,
    attributeCategories: toProductAttributeCategories(value),
    childItems,
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

function normalizeGetProductDetailsResponse(raw: unknown): ProductDetails {
  if (
    isRecord(raw)
    && isRecord(raw.data)
    && isRecord(raw.data.result)
    && Array.isArray(raw.data.result.products)
    && raw.data.result.products.length > 0
  ) {
    const detailedProduct = toProductDetails(raw.data.result.products[0]);
    if (detailedProduct) {
      return detailedProduct;
    }
  }

  const candidates = collectCandidateRecords(raw);
  for (const candidate of candidates) {
    if (!Array.isArray(candidate.products) || candidate.products.length === 0) {
      continue;
    }

    const detailedProduct = toProductDetails(candidate.products[0]);
    if (detailedProduct) {
      return detailedProduct;
    }
  }

  throw new Error("Product details response is missing a valid product payload.");
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

function toDashboardSummary(value: unknown): DashboardSummary {
  if (!isRecord(value)) {
    return {
      activeOrders: 0,
      pastOrders: 0,
      totalAssets: 0,
      totalQuotes: 0,
      totalRevenue: 0,
    };
  }

  return {
    activeOrders: asNumberLike(value.activeOrders) ?? 0,
    pastOrders: asNumberLike(value.pastOrders) ?? 0,
    totalAssets: asNumberLike(value.totalAssets) ?? 0,
    totalQuotes: asNumberLike(value.totalQuotes) ?? 0,
    totalRevenue: asNumberLike(value.totalRevenue) ?? 0,
  };
}

function toDashboardFulfillment(value: unknown): DashboardOrderFulfillment | null {
  if (!isRecord(value)) {
    return null;
  }

  return {
    steps: Array.isArray(value.steps)
      ? value.steps
          .map((step) => toDashboardFulfillmentStep(step))
          .filter((step): step is DashboardOrderFulfillmentStep => Boolean(step))
      : [],
    completedSteps: asNumberLike(value.completedSteps),
    failedSteps: asNumberLike(value.failedSteps),
    hasFallout: asBooleanOrNull(value.hasFallout),
    inProgressSteps: asNumberLike(value.inProgressSteps),
    planAgeHours: asNumberLike(value.planAgeHours),
    planState: asNonEmptyString(value.planState),
    priority: asNonEmptyString(value.priority),
    progressPercent: asNumberLike(value.progressPercent),
    sourceType: asNonEmptyString(value.sourceType),
    state: asNonEmptyString(value.state),
    totalSteps: asNumberLike(value.totalSteps),
  };
}

function toDashboardOrder(value: unknown): DashboardOrder | null {
  if (!isRecord(value)) {
    return null;
  }

  const orderId = asNonEmptyString(value.orderId);
  if (!orderId) {
    return null;
  }

  return {
    activationProgressPercent: asNumberLike(value.activationProgressPercent),
    activationTime: asNonEmptyString(value.activationTime),
    amount: asNumberLike(value.amount),
    effectiveDate: asNonEmptyString(value.effectiveDate),
    fulfillment: toDashboardFulfillment(value.fulfillment),
    hoursRemaining: asNumberLike(value.hoursRemaining),
    isActivationEligible: asBooleanOrNull(value.isActivationEligible),
    isActivationPending: asBooleanOrNull(value.isActivationPending),
    millisecondsRemaining: asNumberLike(value.millisecondsRemaining),
    minutesRemaining: asNumberLike(value.minutesRemaining),
    notes: asNonEmptyString(value.notes),
    orderId,
    status: asNonEmptyString(value.status),
  };
}

function toDashboardQuote(value: unknown): DashboardQuote | null {
  if (!isRecord(value)) {
    return null;
  }

  const quoteId = asNonEmptyString(value.quoteId);
  if (!quoteId) {
    return null;
  }

  return {
    name: asNonEmptyString(value.name),
    notes: asNonEmptyString(value.notes),
    quoteId,
    status: asNonEmptyString(value.status),
    totalAmount: asNumberLike(value.totalAmount),
  };
}

function toDashboardAsset(value: unknown): DashboardAsset | null {
  if (!isRecord(value)) {
    return null;
  }

  const assetId = asNonEmptyString(value.assetId);
  if (!assetId) {
    return null;
  }

  return {
    assetId,
    name: asNonEmptyString(value.name),
    productFamily: asNonEmptyString(value.productFamily),
    status: asNonEmptyString(value.status),
  };
}

function toDashboardInsights(value: unknown): DashboardInsight[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((entry) => {
      if (!isRecord(entry)) {
        return null;
      }

      return {
        message: asNonEmptyString(entry.message),
        priority: asNonEmptyString(entry.priority),
        type: asNonEmptyString(entry.type),
      } satisfies DashboardInsight;
    })
    .filter((entry): entry is DashboardInsight => Boolean(entry));
}

function toDashboardOrderList(value: unknown): DashboardOrder[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.map((entry) => toDashboardOrder(entry)).filter((entry): entry is DashboardOrder => Boolean(entry));
}

function normalizeDashboardResponse(raw: unknown): DashboardSnapshot {
  if (!isRecord(raw)) {
    throw new Error("Dashboard response is malformed.");
  }

  const userId = asNonEmptyString(raw.user);
  const data = raw.data;
  if (!isRecord(data) || data.success !== true) {
    throw new Error("Dashboard response indicates failure.");
  }

  const result = data.result;
  if (!isRecord(result)) {
    throw new Error("Dashboard response is missing result data.");
  }

  const activeOrders = toDashboardOrderList(result.activeOrders);
  const inProgressOrders = toDashboardOrderList(result.inProgressOrders);
  const pastOrders = toDashboardOrderList(result.pastOrders);
  const quotes = Array.isArray(result.quotes)
    ? result.quotes.map((entry) => toDashboardQuote(entry)).filter((entry): entry is DashboardQuote => Boolean(entry))
    : [];
  const assets = Array.isArray(result.assets)
    ? result.assets.map((entry) => toDashboardAsset(entry)).filter((entry): entry is DashboardAsset => Boolean(entry))
    : [];

  return {
    userId,
    summary: toDashboardSummary(result.summary),
    activeOrders,
    inProgressOrders,
    pastOrders,
    quotes,
    assets,
    aiInsights: toDashboardInsights(result.aiInsights),
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

export async function getProductDetails(
  payload: GetProductDetailsPayload
): Promise<ProductDetails> {
  const response = await callIntegration<unknown, GetProductDetailsPayload>(
    INTEGRATION_ROUTES.getProductDetails,
    payload
  );
  return normalizeGetProductDetailsResponse(response);
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

export async function getDashboardData(payload: GetDashboardDataPayload): Promise<DashboardSnapshot> {
  const response = await callIntegration<unknown, GetDashboardDataPayload>(
    INTEGRATION_ROUTES.getDashboardData,
    payload
  );
  return normalizeDashboardResponse(response);
}
