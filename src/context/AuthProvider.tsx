import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  type User,
} from "firebase/auth";
import { auth } from "../auth/firebaseClient";
import {
  clearRcaIdentityStorage,
  getDefaultRcaSyncStatus,
  readRcaIdentity,
  readRcaSyncStatus,
  writeRcaIdentity,
  writeRcaSyncStatus,
} from "../services/auth/rcaIdentityStorage";
import { clearCatalogOptionsCache } from "../services/catalog/catalogService";
import { syncUser } from "../services/salesforceApi";
import { requestPasswordReset } from "../services/auth/passwordResetService";
import { AuthContext } from "./AuthContext";
import type { RcaIdentity, RcaSyncStatus, SignupResult } from "./authTypes";

async function resolveAccessToken(user: User | null): Promise<string | null> {
  if (!user) {
    return null;
  }

  return user.getIdToken();
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(auth.currentUser);
  const [rcaIdentity, setRcaIdentityState] = useState<RcaIdentity | null>(() => readRcaIdentity());
  const [rcaSyncStatus, setRcaSyncStatus] = useState<RcaSyncStatus>(() => getDefaultRcaSyncStatus());

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (nextUser: User | null) => {
      setCurrentUser(nextUser);
      if (nextUser?.uid) {
        setRcaSyncStatus(readRcaSyncStatus(nextUser.uid));
      } else {
        setRcaSyncStatus(getDefaultRcaSyncStatus());
      }
      setIsAuthReady(true);
    });

    return () => unsubscribe();
  }, []);

  const loginWithCredentials = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email.trim(), password);
  };

  const signupWithCredentials = async (
    fullName: string,
    email: string,
    password: string
  ): Promise<SignupResult> => {
    const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
    const displayName = fullName.trim();
    let profileUpdateFailed = false;

    if (displayName) {
      try {
        await updateProfile(userCredential.user, { displayName });
      } catch {
        // Avoid failing account creation when profile metadata update is transiently unavailable.
        profileUpdateFailed = true;
      }
    }

    return { profileUpdateFailed };
  };

  const getAccessToken = async () => {
    const user = auth.currentUser ?? currentUser;
    return resolveAccessToken(user);
  };

  const setRcaIdentity = (identity: RcaIdentity) => {
    setRcaIdentityState(identity);
    writeRcaIdentity(identity);
  };

  const markSyncFailure = (errorMessage?: string) => {
    const user = auth.currentUser ?? currentUser;
    if (!user?.uid) {
      return;
    }

    const timestamp = new Date().toISOString();
    setRcaSyncStatus((previous) => {
      const next: RcaSyncStatus = {
        state: "failed",
        lastAttemptAt: timestamp,
        lastSuccessAt: previous.lastSuccessAt,
        lastFailedAt: timestamp,
        lastErrorMessage: errorMessage ?? null,
      };
      writeRcaSyncStatus(user.uid, next);
      return next;
    });
  };

  const markSyncSuccess = () => {
    const user = auth.currentUser ?? currentUser;
    if (!user?.uid) {
      return;
    }

    const timestamp = new Date().toISOString();
    setRcaSyncStatus(() => {
      const next: RcaSyncStatus = {
        state: "synced",
        lastAttemptAt: timestamp,
        lastSuccessAt: timestamp,
        lastFailedAt: null,
        lastErrorMessage: null,
      };
      writeRcaSyncStatus(user.uid, next);
      return next;
    });
  };

  const syncRcaIdentity = async (): Promise<{ success: boolean; identity: RcaIdentity | null }> => {
    try {
      const response = await syncUser({});
      const identity = {
        accountId: response.accountId,
        contactId: response.contactId,
      };
      setRcaIdentity(identity);
      markSyncSuccess();
      return { success: true, identity };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : undefined;
      markSyncFailure(errorMessage);
      return { success: false, identity: null };
    }
  };

  const retryRcaSync = async (): Promise<boolean> => {
    const result = await syncRcaIdentity();
    return result.success;
  };

  const clearRcaIdentity = () => {
    setRcaIdentityState(null);
    clearRcaIdentityStorage();
    clearCatalogOptionsCache();
  };

  const logout = async () => {
    await signOut(auth);
    clearRcaIdentity();
  };

  const isLoggedIn = Boolean(currentUser);

  return (
    <AuthContext.Provider
      value={{
        isAuthReady,
        isLoggedIn,
        currentUser,
        rcaIdentity,
        rcaSyncStatus,
        loginWithCredentials,
        signupWithCredentials,
        syncRcaIdentity,
        retryRcaSync,
        setRcaIdentity,
        clearRcaIdentity,
        requestPasswordReset,
        getAccessToken,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
