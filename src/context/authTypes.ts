import type { User } from "firebase/auth";

export type SignupResult = {
  profileUpdateFailed: boolean;
};

export type RcaIdentity = {
  accountId: string;
  contactId: string;
};

export type RcaSyncState = "unknown" | "failed" | "synced";

export type RcaSyncStatus = {
  state: RcaSyncState;
  lastAttemptAt: string | null;
  lastSuccessAt: string | null;
  lastFailedAt: string | null;
  lastErrorMessage: string | null;
};

export type AuthContextType = {
  isAuthReady: boolean;
  isLoggedIn: boolean;
  currentUser: User | null;
  rcaIdentity: RcaIdentity | null;
  rcaSyncStatus: RcaSyncStatus;
  loginWithCredentials: (email: string, password: string) => Promise<void>;
  signupWithCredentials: (fullName: string, email: string, password: string) => Promise<SignupResult>;
  syncRcaIdentity: () => Promise<{ success: boolean; identity: RcaIdentity | null }>;
  retryRcaSync: () => Promise<boolean>;
  setRcaIdentity: (identity: RcaIdentity) => void;
  clearRcaIdentity: () => void;
  requestPasswordReset: (email: string) => Promise<void>;
  getAccessToken: () => Promise<string | null>;
  logout: () => Promise<void>;
};
