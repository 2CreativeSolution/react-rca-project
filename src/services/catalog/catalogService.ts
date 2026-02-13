import { callIntegration } from "../salesforceApi";
import type { CatalogApiEnvelope, CatalogItem, CatalogPageData, CatalogRecord } from "./types";

const CATALOGS_ENDPOINT = "/api/listCatalogs";
const DEFAULT_PAYLOAD = { defaultCatalogName: "" };

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

export async function fetchCatalogs(): Promise<CatalogPageData> {
  const response = await callIntegration<unknown, typeof DEFAULT_PAYLOAD>(CATALOGS_ENDPOINT, DEFAULT_PAYLOAD);
  return normalizeCatalogResponse(response);
}
