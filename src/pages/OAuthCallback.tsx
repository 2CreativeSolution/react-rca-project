import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";

export default function OAuthCallback() {
  const navigate = useNavigate();
  const { setAccessToken } = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");

    if (!code) {
      navigate("/login");
      return;
    }

    // Send code to Apex for token exchange
    fetch("/services/apexrest/api/integration", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "exchangeToken",
        code,
      }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setAccessToken(data.accessToken);
          navigate("/dashboard");
        } else {
          navigate("/login");
        }
      })
      .catch(() => navigate("/login"));
  }, [navigate, setAccessToken]);

  return <div>Signing you in securely…</div>;
}
