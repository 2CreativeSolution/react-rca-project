import { postIntegration } from "../api/integrationClient";
import { auth } from "../auth/firebaseClient";
import { INTEGRATION_ROUTES } from "../constants/integrationRoutes";
import type { RcaIdentity } from "../context/authTypes";

type UnknownRecord = Record<string, unknown>;

export type SyncUserResponse = {
  accountId: string;
  contactId: string;
};

export type DecisionResponse = {
  isActive: boolean;
};

export type ProductSummary = {
  id?: string;
  name: string;
  productCode?: string;
  isActive?: boolean;
  availabilityDate?: string;
  productSpecificationTypeName?: string;
  categories: string[];
  productSellingModelOptions: ProductSellingModelOptionSummary[];
};

export type ProductSellingModelOptionSummary = {
  id?: string;
  productId?: string;
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

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null;
}

function asNonEmptyString(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0 ? value : null;
}

function asNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
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
  const isActive = findBooleanField(candidates, "isActive");

  if (isActive === null) {
    throw new Error("Decision response is missing required isActive flag.");
  }

  return {
    isActive,
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
  const productSellingModelOptions = Array.isArray(value.productSellingModelOptions)
    ? value.productSellingModelOptions
        .map((option) => {
          if (!isRecord(option)) {
            return null;
          }

          const model = isRecord(option.productSellingModel) ? option.productSellingModel : {};
          return {
            id: asNonEmptyString(option.id) ?? undefined,
            productId: asNonEmptyString(option.productId) ?? undefined,
            isDefault: option.isDefault === true,
            model: {
              id: asNonEmptyString(model.id) ?? undefined,
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
    productCode,
    isActive,
    availabilityDate,
    productSpecificationTypeName,
    categories,
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

export async function evaluateDecision(payload: RcaIdentity): Promise<DecisionResponse> {
  const response = await callIntegration<unknown, RcaIdentity>(
    INTEGRATION_ROUTES.createDefaultQuote,
    payload
  );
  return normalizeDecisionResponse(response);
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
