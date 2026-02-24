import {
  Box,
  Button,
  Stack,
} from "@mui/material";
import { useMemo, useState, type FormEvent } from "react";
import { Link as RouterLink, Navigate, useNavigate } from "react-router-dom";
import AuthProgressStatus from "../components/ui/AuthProgressStatus";
import AuthShell from "../components/ui/AuthShell";
import AuthTextField from "../components/ui/AuthTextField";
import { AUTH_COPY } from "../constants/authContent";
import { ROUTES } from "../constants/routes";
import { useAuth } from "../context/useAuth";
import { useNotification } from "../context/useNotification";
import { evaluateDecision } from "../services/salesforceApi";

type LoginProgressStep = "authenticating" | "syncingIdentity" | "evaluatingDecision" | "finalizing";

export default function Login() {
  const loginCopy = AUTH_COPY.login;
  const navigate = useNavigate();
  const {
    isAuthReady,
    isLoggedIn,
    clearDecisionSession,
    decisionSession,
    loginWithCredentials,
    rcaIdentity,
    setDecisionSession,
    syncRcaIdentity,
  } =
    useAuth();
  const { notifyError, notifyWarning } = useNotification();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasCredentialSubmit, setHasCredentialSubmit] = useState(false);
  const [progressStep, setProgressStep] = useState<LoginProgressStep>("authenticating");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const progressLabel = useMemo(() => loginCopy.progress[progressStep], [loginCopy.progress, progressStep]);

  if (isAuthReady && isLoggedIn && !hasCredentialSubmit) {
    const hasActiveOrderAndAsset = decisionSession.isActiveOrder && decisionSession.isActiveAsset;
    return <Navigate to={hasActiveOrderAndAsset ? ROUTES.dashboard : ROUTES.catalog} replace />;
  }

  const handleCredentialsSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setHasCredentialSubmit(true);
    setIsSubmitting(true);
    setProgressStep("authenticating");

    try {
      setProgressStep("authenticating");
      await loginWithCredentials(email, password);

      let resolvedIdentity = rcaIdentity;
      if (!resolvedIdentity) {
        setProgressStep("syncingIdentity");
        const syncResult = await syncRcaIdentity();
        if (syncResult.success && syncResult.identity) {
          resolvedIdentity = {
            accountId: syncResult.identity.accountId,
            contactId: syncResult.identity.contactId,
          };
        } else {
          resolvedIdentity = null;
        }
      }

      if (!resolvedIdentity) {
        notifyWarning(loginCopy.missingIdentityWarningMessage);
        navigate(ROUTES.catalog, { replace: true });
        return;
      }

      try {
        setProgressStep("evaluatingDecision");
        const decision = await evaluateDecision();
        setDecisionSession(decision);
        const hasActiveOrderAndAsset = decision.isActiveOrder || decision.isActiveAsset;
        setProgressStep("finalizing");
        navigate(hasActiveOrderAndAsset ? ROUTES.dashboard : ROUTES.catalog, { replace: true });
      } catch {
        clearDecisionSession();
        notifyWarning(loginCopy.decisionWarningMessage);
        navigate(ROUTES.home, { replace: true });
      }
    } catch (error) {
      setHasCredentialSubmit(false);
      notifyError(error instanceof Error ? error.message : loginCopy.credentialErrorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthShell
      panelTitle={loginCopy.panelTitle}
      panelSubtitle={loginCopy.panelSubtitle}
      valuePills={loginCopy.valuePills}
      actionTitle={loginCopy.actionTitle}
      actionSubtitle={loginCopy.actionSubtitle}
    >
      <Stack spacing={5}>
        <Stack
          component="form"
          spacing={2}
          onSubmit={handleCredentialsSubmit}
          noValidate
          sx={{
            p: { xs: 0.5, md: 0 },
            mt: 1.5,
          }}
        >
          <AuthTextField
            label="Email"
            type="email"
            name="email"
            autoComplete="email"
            value={email}
            disabled={isSubmitting}
            onChange={(event) => setEmail(event.target.value)}
          />
          <AuthTextField
            label="Password"
            type="password"
            name="password"
            autoComplete="current-password"
            value={password}
            disabled={isSubmitting}
            onChange={(event) => setPassword(event.target.value)}
          />

          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={isSubmitting}
            sx={{
              py: 1.25,
              borderRadius: 3,
              fontWeight: 800,
            }}
          >
            {loginCopy.submitLabel}
          </Button>

          {isSubmitting ? <AuthProgressStatus active label={progressLabel} /> : null}
        </Stack>

        <Box sx={{ display: "flex", justifyContent: "center", pt: 0.5 }}>
          <Button component={RouterLink} to={ROUTES.signup} size="small" color="inherit" disabled={isSubmitting}>
            {loginCopy.signupCta}
          </Button>
        </Box>
      </Stack>
    </AuthShell>
  );
}
