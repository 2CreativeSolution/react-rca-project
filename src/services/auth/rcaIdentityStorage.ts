import type { RcaIdentity } from "../../context/authTypes";

const RCA_IDENTITY_STORAGE_KEY = "rca.identity.v1";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function asNonEmptyString(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0 ? value : null;
}

function toRcaIdentity(raw: unknown): RcaIdentity | null {
  if (!isRecord(raw)) {
    return null;
  }

  const accountId = asNonEmptyString(raw.accountId);
  const contactId = asNonEmptyString(raw.contactId);
  if (!accountId || !contactId) {
    return null;
  }

  return { accountId, contactId };
}

export function readRcaIdentity(): RcaIdentity | null {
  if (typeof window === "undefined") {
    return null;
  }

  const value = window.localStorage.getItem(RCA_IDENTITY_STORAGE_KEY);
  if (!value) {
    return null;
  }

  try {
    return toRcaIdentity(JSON.parse(value));
  } catch {
    return null;
  }
}

export function writeRcaIdentity(identity: RcaIdentity): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(RCA_IDENTITY_STORAGE_KEY, JSON.stringify(identity));
}

export function clearRcaIdentityStorage(): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(RCA_IDENTITY_STORAGE_KEY);
}

