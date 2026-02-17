import type { User } from "firebase/auth";

export type SignupResult = {
  profileUpdateFailed: boolean;
};

export type RcaIdentity = {
  accountId: string;
  contactId: string;
};

export type AuthContextType = {
  isAuthReady: boolean;
  isLoggedIn: boolean;
  currentUser: User | null;
  rcaIdentity: RcaIdentity | null;
  loginWithCredentials: (email: string, password: string) => Promise<void>;
  signupWithCredentials: (fullName: string, email: string, password: string) => Promise<SignupResult>;
  setRcaIdentity: (identity: RcaIdentity) => void;
  clearRcaIdentity: () => void;
  requestPasswordReset: (email: string) => Promise<void>;
  getAccessToken: () => Promise<string | null>;
  logout: () => Promise<void>;
};
