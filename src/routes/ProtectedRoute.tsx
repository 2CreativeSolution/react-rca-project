import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { ROUTES } from "../constants/routes";
import { useAuth } from "../context/useAuth";

export default function ProtectedRoute({
  children,
}: {
  children: ReactNode;
}) {
  const { isAuthReady, isLoggedIn } = useAuth();

  if (!isAuthReady) {
    return null;
  }

  if (!isLoggedIn) {
    return <Navigate to={ROUTES.login} replace />;
  }

  return <>{children}</>;
}
