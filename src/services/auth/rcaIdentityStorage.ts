import type { RcaIdentity, RcaSyncState, RcaSyncStatus } from "../../context/authTypes";

const RCA_IDENTITY_STORAGE_KEY = "rca.identity.v1";
const RCA_SYNC_STATUS_STORAGE_PREFIX = "rca.syncStatus.v1:";

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

function isRcaSyncState(value: unknown): value is RcaSyncState {
  return value === "unknown" || value === "failed" || value === "synced";
}

function asNullableString(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

function toRcaSyncStatus(raw: unknown): RcaSyncStatus {
  if (!isRecord(raw)) {
    return getDefaultRcaSyncStatus();
  }

  const state = isRcaSyncState(raw.state) ? raw.state : "unknown";

  return {
    state,
    lastAttemptAt: asNullableString(raw.lastAttemptAt),
    lastSuccessAt: asNullableString(raw.lastSuccessAt),
    lastFailedAt: asNullableString(raw.lastFailedAt),
    lastErrorMessage: asNullableString(raw.lastErrorMessage),
  };
}

function getSyncStatusStorageKey(uid: string): string {
  return `${RCA_SYNC_STATUS_STORAGE_PREFIX}${uid}`;
}

export function getDefaultRcaSyncStatus(): RcaSyncStatus {
  return {
    state: "unknown",
    lastAttemptAt: null,
    lastSuccessAt: null,
    lastFailedAt: null,
    lastErrorMessage: null,
  };
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

export function readRcaSyncStatus(uid: string): RcaSyncStatus {
  if (typeof window === "undefined") {
    return getDefaultRcaSyncStatus();
  }

  const normalizedUid = asNonEmptyString(uid);
  if (!normalizedUid) {
    return getDefaultRcaSyncStatus();
  }

  const value = window.localStorage.getItem(getSyncStatusStorageKey(normalizedUid));
  if (!value) {
    return getDefaultRcaSyncStatus();
  }

  try {
    return toRcaSyncStatus(JSON.parse(value));
  } catch {
    return getDefaultRcaSyncStatus();
  }
}

export function writeRcaSyncStatus(uid: string, status: RcaSyncStatus): void {
  if (typeof window === "undefined") {
    return;
  }

  const normalizedUid = asNonEmptyString(uid);
  if (!normalizedUid) {
    return;
  }

  window.localStorage.setItem(getSyncStatusStorageKey(normalizedUid), JSON.stringify(status));
}

export function clearRcaSyncStatus(uid: string): void {
  if (typeof window === "undefined") {
    return;
  }

  const normalizedUid = asNonEmptyString(uid);
  if (!normalizedUid) {
    return;
  }

  window.localStorage.removeItem(getSyncStatusStorageKey(normalizedUid));
}
