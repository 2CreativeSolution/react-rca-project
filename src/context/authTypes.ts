import type { User } from "firebase/auth";

export type SignupResult = {
  profileUpdateFailed: boolean;
};

export type AuthContextType = {
  isAuthReady: boolean;
  isLoggedIn: boolean;
  currentUser: User | null;
  loginWithCredentials: (email: string, password: string) => Promise<void>;
  signupWithCredentials: (fullName: string, email: string, password: string) => Promise<SignupResult>;
  requestPasswordReset: (email: string) => Promise<void>;
  getAccessToken: () => Promise<string | null>;
  logout: () => Promise<void>;
};
