const DATE_PREFIX_PATTERN = /^(\d{4})-(\d{2})-(\d{2})(?:T.*)?$/;

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
