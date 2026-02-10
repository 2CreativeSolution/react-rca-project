import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";

export default function OAuthCallback() {
  const navigate = useNavigate();
  const { setAccessToken } = useAuth();

  useEffect(() => {
    const hash = new URLSearchParams(
      window.location.hash.substring(1)
    );

    const token = hash.get("access_token");

    if (token) {
      setAccessToken(token);
      navigate("/dashboard", { replace: true });
    } else {
      navigate("/login", { replace: true });
    }
  }, [navigate, setAccessToken]);

  return <div>Signing you in…</div>;
}
