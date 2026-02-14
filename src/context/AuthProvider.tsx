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
import { requestPasswordReset } from "../services/auth/passwordResetService";
import { AuthContext } from "./AuthContext";
import type { SignupResult } from "./authTypes";

async function resolveAccessToken(user: User | null): Promise<string | null> {
  if (!user) {
    return null;
  }

  return user.getIdToken();
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(auth.currentUser);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (nextUser: User | null) => {
      setCurrentUser(nextUser);
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

  const logout = async () => {
    await signOut(auth);
  };

  const isLoggedIn = Boolean(currentUser);

  return (
    <AuthContext.Provider
      value={{
        isAuthReady,
        isLoggedIn,
        currentUser,
        loginWithCredentials,
        signupWithCredentials,
        requestPasswordReset,
        getAccessToken,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
