export type AuthContextType = {
  isLoggedIn: boolean;
  accessToken: string | null;
  /** Persists an access token for the active session. */
  setAccessToken: (token: string) => void;
  /** Validates local credentials and creates a local session token. */
  loginWithCredentials: (email: string, password: string) => void;
  /** Registers a local user and creates a local session token. */
  signupWithCredentials: (fullName: string, email: string, password: string) => void;
  /** Clears the active session token. */
  logout: () => void;
};
