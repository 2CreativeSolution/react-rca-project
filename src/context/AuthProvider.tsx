import { useCallback, useEffect, useState } from "react";
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
import { requestPasswordReset } from "../services/auth/passwordResetService";
import {
  ProfilePhotoValidationError,
  deleteProfilePhotoFile,
  hasStoredProfilePhotoPreference,
  readProfilePhoto,
  uploadProfilePhotoFile,
} from "../services/auth/profilePhotoService";
import {
  clearDecisionSession as clearDecisionSessionStorage,
  clearRcaIdentityStorage,
  getDefaultDecisionSession,
  getDefaultRcaSyncStatus,
  readDecisionSession,
  readRcaIdentity,
  readRcaSyncStatus,
  writeDecisionSession,
  writeRcaIdentity,
  writeRcaSyncStatus,
} from "../services/auth/rcaIdentityStorage";
import { clearCatalogOptionsCache } from "../services/catalog/catalogService";
import { createDefaultQuote, syncUser } from "../services/salesforceApi";
import { AuthContext } from "./AuthContext";
import type { DecisionSession, RcaIdentity, RcaSyncStatus, SignupResult } from "./authTypes";

async function resolveAccessToken(user: User | null): Promise<string | null> {
  if (!user) {
    return null;
  }

  return user.getIdToken();
}

function mapProfilePhotoError(error: unknown, fallbackMessage: string): Error {
  if (error instanceof ProfilePhotoValidationError) {
    return error;
  }

  if (error instanceof Error) {
    return error;
  }

  return new Error(fallbackMessage);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(auth.currentUser);
  const [profilePhotoUrl, setProfilePhotoUrl] = useState<string | null>(null);
  const [hasProfilePhotoPreference, setHasProfilePhotoPreference] = useState(false);
  const [rcaIdentity, setRcaIdentityState] = useState<RcaIdentity | null>(() => readRcaIdentity());
  const [rcaSyncStatus, setRcaSyncStatus] = useState<RcaSyncStatus>(() => getDefaultRcaSyncStatus());
  const [decisionSession, setDecisionSessionState] = useState<DecisionSession>(() => getDefaultDecisionSession());

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (nextUser: User | null) => {
      setCurrentUser(nextUser);
      if (nextUser?.uid) {
        setRcaSyncStatus(readRcaSyncStatus(nextUser.uid));
        setDecisionSessionState(readDecisionSession(nextUser.uid));
        setProfilePhotoUrl(readProfilePhoto(nextUser.uid));
        setHasProfilePhotoPreference(hasStoredProfilePhotoPreference(nextUser.uid));
      } else {
        setRcaSyncStatus(getDefaultRcaSyncStatus());
        setDecisionSessionState(getDefaultDecisionSession());
        setProfilePhotoUrl(null);
        setHasProfilePhotoPreference(false);
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

  const initializeDefaultQuote = async (
    identity: RcaIdentity
  ): Promise<{ success: boolean; salesTransactionId: string | null }> => {
    try {
      const response = await createDefaultQuote({
        accountId: identity.accountId,
        contactId: identity.contactId,
      });
      setDecisionSessionState((previous) => {
        const next: DecisionSession = {
          ...previous,
          salesTransactionId: response.salesTransactionId,
        };
        const user = auth.currentUser ?? currentUser;
        if (user?.uid) {
          writeDecisionSession(user.uid, next);
        }
        return next;
      });
      return { success: true, salesTransactionId: response.salesTransactionId };
    } catch {
      return { success: false, salesTransactionId: null };
    }
  };

  const setDecisionSession = useCallback(
    (session: DecisionSession) => {
      setDecisionSessionState(session);
      const user = auth.currentUser ?? currentUser;
      if (user?.uid) {
        writeDecisionSession(user.uid, session);
      }
    },
    [currentUser]
  );

  const clearDecisionSession = useCallback(() => {
    setDecisionSessionState(getDefaultDecisionSession());
    const user = auth.currentUser ?? currentUser;
    if (user?.uid) {
      clearDecisionSessionStorage(user.uid);
    }
  }, [currentUser]);

  const clearRcaIdentity = () => {
    setRcaIdentityState(null);
    clearDecisionSession();
    clearRcaIdentityStorage();
    clearCatalogOptionsCache();
  };

  const uploadProfilePhoto = async (file: File): Promise<{ photoURL: string }> => {
    const user = auth.currentUser ?? currentUser;
    if (!user?.uid) {
      throw new Error("You must be signed in to upload a profile photo.");
    }

    try {
      const result = await uploadProfilePhotoFile({ uid: user.uid, file });
      setProfilePhotoUrl(result.photoURL);
      setHasProfilePhotoPreference(true);
      return result;
    } catch (error) {
      throw mapProfilePhotoError(error, "Unable to upload profile photo.");
    }
  };

  const removeProfilePhoto = async (): Promise<void> => {
    const user = auth.currentUser ?? currentUser;
    if (!user?.uid) {
      throw new Error("You must be signed in to remove a profile photo.");
    }

    try {
      await deleteProfilePhotoFile(user.uid);
      setProfilePhotoUrl(null);
      setHasProfilePhotoPreference(true);
    } catch (error) {
      throw mapProfilePhotoError(error, "Unable to remove profile photo.");
    }
  };

  const logout = async () => {
    await signOut(auth);
    clearRcaIdentity();
  };

  const isLoggedIn = Boolean(currentUser);
  const resolvedProfilePhotoUrl = hasProfilePhotoPreference ? profilePhotoUrl : currentUser?.photoURL?.trim() || null;

  return (
    <AuthContext.Provider
      value={{
        isAuthReady,
        isLoggedIn,
        currentUser,
        profilePhotoUrl: resolvedProfilePhotoUrl,
        rcaIdentity,
        rcaSyncStatus,
        decisionSession,
        loginWithCredentials,
        signupWithCredentials,
        syncRcaIdentity,
        initializeDefaultQuote,
        retryRcaSync,
        setDecisionSession,
        clearDecisionSession,
        setRcaIdentity,
        clearRcaIdentity,
        uploadProfilePhoto,
        removeProfilePhoto,
        requestPasswordReset,
        getAccessToken,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
