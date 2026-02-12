export type AuthMethod = "salesforce" | "local";

export type AuthContextType = {
  authMethod: AuthMethod | null;
  isLoggedIn: boolean;
  token: string | null;
  /** Persists a Salesforce OAuth session token. */
  setSalesforceSession: (token: string) => void;
  /** Validates local credentials and creates a local session token. */
  loginWithCredentials: (email: string, password: string) => void;
  /** Registers a local user and creates a local session token. */
  signupWithCredentials: (fullName: string, email: string, password: string) => void;
  /** Clears the active session token. */
  logout: () => void;
};
