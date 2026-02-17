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

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null;
}

function asNonEmptyString(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0 ? value : null;
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
