export type SignupResult = {
  profileUpdateFailed: boolean;
};

export type AuthContextType = {
  isAuthReady: boolean;
  isLoggedIn: boolean;
  loginWithCredentials: (email: string, password: string) => Promise<void>;
  signupWithCredentials: (fullName: string, email: string, password: string) => Promise<SignupResult>;
  getAccessToken: () => Promise<string | null>;
  logout: () => Promise<void>;
};
