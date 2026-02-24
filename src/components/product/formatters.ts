import type { ProductSummary } from "../../services/salesforceApi";

const DATE_PREFIX_PATTERN = /^(\d{4})-(\d{2})-(\d{2})(?:T.*)?$/;

export type AvailabilityStatus = "available" | "unavailable" | "unknown";

function formatDateFromParts(
  yearText: string,
  monthText: string,
  dayText: string,
  fallback: string
): string {
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  const utcDate = new Date(Date.UTC(year, month - 1, day));

  if (
    Number.isNaN(utcDate.getTime()) ||
    utcDate.getUTCFullYear() !== year ||
    utcDate.getUTCMonth() !== month - 1 ||
    utcDate.getUTCDate() !== day
  ) {
    return fallback;
  }

  return utcDate.toLocaleDateString(undefined, { timeZone: "UTC" });
}

export function formatAvailabilityDate(value: string | undefined, fallback: string): string {
  if (!value) {
    return fallback;
  }

  const datePrefixMatch = value.match(DATE_PREFIX_PATTERN);
  if (datePrefixMatch) {
    return formatDateFromParts(
      datePrefixMatch[1],
      datePrefixMatch[2],
      datePrefixMatch[3],
      fallback
    );
  }

  const parsedDate = new Date(value);

  if (Number.isNaN(parsedDate.getTime())) {
    return fallback;
  }

  return parsedDate.toLocaleDateString();
}

export function formatBooleanLabel(
  value: boolean | undefined,
  trueLabel: string,
  falseLabel: string,
  fallbackLabel: string
): string {
  if (value === true) {
    return trueLabel;
  }

  if (value === false) {
    return falseLabel;
  }

  return fallbackLabel;
}

export function resolveAvailabilityStatus(product: ProductSummary, nowTimestamp: number): AvailabilityStatus {
  if (product.isActive !== true) {
    return product.isActive === false ? "unavailable" : "unknown";
  }

  if (!product.availabilityDate) {
    return "available";
  }

  const parsedAvailabilityDate = Date.parse(product.availabilityDate);
  if (Number.isNaN(parsedAvailabilityDate)) {
    return "unknown";
  }

  return parsedAvailabilityDate <= nowTimestamp ? "available" : "unavailable";
}

export function toProductInitials(name: string, fallbackLabel: string): string {
  const tokens = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2);

  if (tokens.length === 0) {
    return fallbackLabel.slice(0, 2).toUpperCase();
  }

  return tokens.map((token) => token[0]?.toUpperCase() ?? "").join("");
}

function toNormalizedCurrencyCode(value: string | undefined): string | undefined {
  if (!value) {
    return undefined;
  }

  const normalized = value.trim().toUpperCase();
  return /^[A-Z]{3}$/.test(normalized) ? normalized : undefined;
}

function resolveProductDisplayPrice(product: ProductSummary): { amount?: number; currencyCode?: string } {
  const selectedOption = product.productSellingModelOptions.find((option) => option.isDefault)
    ?? product.productSellingModelOptions[0];
  const selectedModelId = selectedOption?.model.id;
  const selectedPricebookEntry = product.pricebookEntries.find(
    (entry) => selectedOption?.pricebookEntryId && entry.id === selectedOption.pricebookEntryId
  );
  const modelMatchedPricebookEntry = product.pricebookEntries.find(
    (entry) => entry.productSellingModelId && entry.productSellingModelId === selectedModelId
  );
  const pricedFallbackEntry = product.pricebookEntries.find((entry) => typeof entry.unitPrice === "number");
  const resolvedEntry = selectedPricebookEntry ?? modelMatchedPricebookEntry ?? pricedFallbackEntry;
  const resolvedAmount = selectedOption?.unitPrice ?? resolvedEntry?.unitPrice;

  return {
    amount: resolvedAmount,
    currencyCode: toNormalizedCurrencyCode(resolvedEntry?.currencyIsoCode),
  };
}

export function formatProductPrice(product: ProductSummary, fallback: string): string {
  const { amount, currencyCode } = resolveProductDisplayPrice(product);

  if (typeof amount !== "number" || !Number.isFinite(amount)) {
    return fallback;
  }

  if (currencyCode) {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: currencyCode,
      maximumFractionDigits: 2,
    }).format(amount);
  }

  return new Intl.NumberFormat(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}
