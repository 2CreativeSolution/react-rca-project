export function formatCurrency(amount: number | null): string {
  if (amount === null) {
    return "—";
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(value: string | null): string {
  if (!value) {
    return "—";
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return "—";
  }

  return parsed.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatDateTime(value: string | null): string {
  if (!value) {
    return "—";
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return "—";
  }

  return parsed.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function formatEta(hoursRemaining: number | null, minutesRemaining: number | null): string {
  if (hoursRemaining === null && minutesRemaining === null) {
    return "Not available";
  }

  const parts: string[] = [];
  if (hoursRemaining !== null) {
    parts.push(`${hoursRemaining}h`);
  }
  if (minutesRemaining !== null) {
    parts.push(`${minutesRemaining}m`);
  }

  return parts.join(" ");
}

export function formatProgress(value: number | null): string {
  if (value === null) {
    return "—";
  }

  return `${Math.max(0, Math.min(100, Math.round(value)))}%`;
}

export function mapStatusColor(status: string | null): "success" | "warning" | "info" | "default" {
  const normalized = status?.toLowerCase() ?? "";

  if (normalized.includes("accept") || normalized.includes("install") || normalized.includes("activat")) {
    return "success";
  }

  if (normalized.includes("delay") || normalized.includes("fail") || normalized.includes("error")) {
    return "warning";
  }

  if (normalized.includes("draft") || normalized.includes("pending") || normalized.includes("register")) {
    return "info";
  }

  return "default";
}
