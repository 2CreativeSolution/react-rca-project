import { INTEGRATION_ROUTES } from "../../constants/integrationRoutes";
import { auth } from "../../auth/firebaseClient";
import { callIntegration } from "../salesforceApi";
import type { CatalogApiEnvelope, CatalogItem, CatalogPageData, CatalogRecord } from "./types";

const DEFAULT_PAYLOAD = { defaultCatalogName: "" };
const CATALOG_CACHE_TTL_MS = 10 * 60 * 1000;

export type CatalogOption = {
  id: string;
  name: string;
};

let catalogPageCache: {
  ownerKey: string;
  value: CatalogPageData;
  fetchedAt: number;
} | null = null;
let catalogPageRequestInFlight: Promise<CatalogPageData> | null = null;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function asString(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

function asNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function asOptionalString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim().length > 0 ? value : undefined;
}

function mapCatalogRecord(rawCatalog: unknown): CatalogItem | null {
  if (!isRecord(rawCatalog)) {
    return null;
  }

  const id = asString(rawCatalog.id);
  const name = asString(rawCatalog.name);
  const catalogType = asString(rawCatalog.catalogType);
  const numberOfCategories = asNumber(rawCatalog.numberOfCategories);

  if (!id || !name || !catalogType || numberOfCategories === null) {
    return null;
  }

  const catalog: CatalogRecord = {
    id,
    name,
    catalogType,
    numberOfCategories,
    code: asOptionalString(rawCatalog.code),
    description: asOptionalString(rawCatalog.description),
    effectiveStartDate: asOptionalString(rawCatalog.effectiveStartDate),
    effectiveEndDate: asOptionalString(rawCatalog.effectiveEndDate),
  };

  return { ...catalog };
}

function normalizeCatalogResponse(raw: unknown): CatalogPageData {
  if (!isRecord(raw)) {
    throw new Error("Invalid catalog response received.");
  }

  const envelope = raw as Partial<CatalogApiEnvelope> & Record<string, unknown>;
  const data = envelope.data;

  if (!isRecord(data) || data.success !== true || !isRecord(data.result)) {
    throw new Error("Catalog response is missing expected data fields.");
  }

  const result = data.result as Record<string, unknown>;
  const rawCatalogs = result.catalogs;

  if (!Array.isArray(rawCatalogs)) {
    throw new Error("Catalog response does not contain a valid catalog list.");
  }

  const items = rawCatalogs
    .map((catalog) => mapCatalogRecord(catalog))
    .filter((catalog): catalog is CatalogItem => Boolean(catalog));

  const count = asNumber(result.count) ?? items.length;
  const correlationId = asString(result.correlationId) ?? "";
  const statusMessage = isRecord(result.status)
    ? asString(result.status.message) ?? "Catalogs loaded successfully."
    : "Catalogs loaded successfully.";

  return {
    items,
    count,
    correlationId,
    statusMessage,
  };
}

type FetchCatalogsOptions = {
  forceRefresh?: boolean;
};

export async function fetchCatalogs(options: FetchCatalogsOptions = {}): Promise<CatalogPageData> {
  const { forceRefresh = false } = options;
  const now = Date.now();
  const currentOwnerKey = auth.currentUser?.uid ?? "anonymous";

  if (
    !forceRefresh &&
    catalogPageCache &&
    catalogPageCache.ownerKey === currentOwnerKey &&
    now - catalogPageCache.fetchedAt < CATALOG_CACHE_TTL_MS
  ) {
    return catalogPageCache.value;
  }

  if (!forceRefresh && catalogPageRequestInFlight) {
    return catalogPageRequestInFlight;
  }

  const request = callIntegration<unknown, typeof DEFAULT_PAYLOAD>(
    INTEGRATION_ROUTES.listCatalogs,
    DEFAULT_PAYLOAD
  ).then((response) => {
    const data = normalizeCatalogResponse(response);
    catalogPageCache = {
      ownerKey: currentOwnerKey,
      value: data,
      fetchedAt: Date.now(),
    };
    return data;
  });

  catalogPageRequestInFlight = request;

  try {
    return await request;
  } finally {
    if (catalogPageRequestInFlight === request) {
      catalogPageRequestInFlight = null;
    }
  }
}

export async function getCatalogOptions(): Promise<CatalogOption[]> {
  const data = await fetchCatalogs();
  return data.items.map((item) => ({
    id: item.id,
    name: item.name,
  }));
}

export function clearCatalogOptionsCache(): void {
  catalogPageCache = null;
  catalogPageRequestInFlight = null;
}
