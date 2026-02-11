import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../constants/routes";
import { useAuth } from "../context/useAuth";
import { useNotification } from "../context/useNotification";

export default function OAuthCallback() {
  const navigate = useNavigate();
  const { setSalesforceSession } = useAuth();
  const { notifyError } = useNotification();

  useEffect(() => {
    const hash = new URLSearchParams(
      window.location.hash.substring(1)
    );

    const token = hash.get("access_token");

    if (token) {
      setSalesforceSession(token);
      navigate(ROUTES.catalog, { replace: true });
    } else {
      notifyError("Salesforce sign-in could not be completed.");
      navigate(ROUTES.login, { replace: true });
    }
  }, [navigate, notifyError, setSalesforceSession]);

  return <div>Signing you in…</div>;
}
