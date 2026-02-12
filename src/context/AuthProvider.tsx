import { useState } from "react";
import type { ReactNode } from "react";
import { AuthContext } from "./AuthContext";
import { ACCESS_TOKEN_KEY, AUTH_METHOD_KEY } from "../constants/authStorage";
import {
  registerLocalUser,
  validateLocalCredentials,
} from "../services/localAuth";
import type { AuthMethod } from "./authTypes";

type StoredSession = {
  authMethod: AuthMethod | null;
  token: string | null;
};

function isAuthMethod(value: string | null): value is AuthMethod {
  return value === "local" || value === "salesforce";
}

function clearStoredSession() {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.removeItem(ACCESS_TOKEN_KEY);
  window.localStorage.removeItem(AUTH_METHOD_KEY);
}

function readStoredSession(): StoredSession {
  if (typeof window === "undefined") {
    return { authMethod: null, token: null };
  }

  const rawMethod = window.localStorage.getItem(AUTH_METHOD_KEY);
  const rawToken = window.localStorage.getItem(ACCESS_TOKEN_KEY);

  if (!isAuthMethod(rawMethod) || !rawToken?.trim()) {
    clearStoredSession();
    return { authMethod: null, token: null };
  }

  return { authMethod: rawMethod, token: rawToken };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<StoredSession>(() => readStoredSession());

  const setAuthSession = (authMethod: AuthMethod, token: string) => {
    const normalizedToken = token.trim();
    if (!normalizedToken) {
      clearStoredSession();
      setSession({ authMethod: null, token: null });
      return;
    }

    if (typeof window !== "undefined") {
      window.localStorage.setItem(ACCESS_TOKEN_KEY, normalizedToken);
      window.localStorage.setItem(AUTH_METHOD_KEY, authMethod);
    }
    setSession({ authMethod, token: normalizedToken });
  };

  const setSalesforceSession = (token: string) => {
    setAuthSession("salesforce", token);
  };

  const loginWithCredentials = (email: string, password: string) => {
    validateLocalCredentials(email, password);
    setAuthSession("local", `local-auth:${Date.now()}`);
  };

  const signupWithCredentials = (fullName: string, email: string, password: string) => {
    registerLocalUser({ fullName, email, password });
    setAuthSession("local", `local-auth:${Date.now()}`);
  };

  const logout = () => {
    clearStoredSession();
    setSession({ authMethod: null, token: null });
  };

  const isLoggedIn = Boolean(session.authMethod && session.token);

  return (
    <AuthContext.Provider
      value={{
        authMethod: session.authMethod,
        isLoggedIn,
        token: session.token,
        setSalesforceSession,
        loginWithCredentials,
        signupWithCredentials,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
