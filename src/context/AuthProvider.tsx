import { useState } from "react";
import type { ReactNode } from "react";
import { AuthContext } from "./AuthContext";
import { ACCESS_TOKEN_KEY } from "../constants/authStorage";
import {
  registerLocalUser,
  validateLocalCredentials,
} from "../services/localAuth";

function readStoredToken() {
  if (typeof window === "undefined") {
    return null;
  }
  return window.localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [accessToken, setAccessTokenState] = useState<string | null>(() => readStoredToken());

  const setAccessToken = (token: string) => {
    setAccessTokenState(token);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(ACCESS_TOKEN_KEY, token);
    }
  };

  const loginWithCredentials = (email: string, password: string) => {
    validateLocalCredentials(email, password);
    setAccessToken(`local-auth:${Date.now()}`);
  };

  const signupWithCredentials = (fullName: string, email: string, password: string) => {
    registerLocalUser({ fullName, email, password });
    setAccessToken(`local-auth:${Date.now()}`);
  };

  const logout = () => {
    setAccessTokenState(null);
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(ACCESS_TOKEN_KEY);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn: !!accessToken,
        accessToken,
        setAccessToken,
        loginWithCredentials,
        signupWithCredentials,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
