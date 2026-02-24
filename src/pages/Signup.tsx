import { Box, Button, Stack } from "@mui/material";
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

type SignupProgressStep =
  | "creatingAccount"
  | "syncingIdentity"
  | "creatingDefaultQuote"
  | "evaluatingDecision"
  | "finalizing";

function isEmailValid(email: string) {
  return /\S+@\S+\.\S+/.test(email);
}

export default function Signup() {
  const signupCopy = AUTH_COPY.signup;
  const navigate = useNavigate();
  const {
    clearDecisionSession,
    initializeDefaultQuote,
    isAuthReady,
    isLoggedIn,
    setDecisionSession,
    signupWithCredentials,
    syncRcaIdentity,
  } = useAuth();
  const { notifyError, notifyWarning } = useNotification();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [progressStep, setProgressStep] = useState<SignupProgressStep>("creatingAccount");
  const progressLabel = useMemo(() => signupCopy.progress[progressStep], [progressStep, signupCopy.progress]);

  const validationError = useMemo(() => {
    if (!fullName.trim()) {
      return signupCopy.validation.fullNameRequired;
    }
    if (!isEmailValid(email.trim())) {
      return signupCopy.validation.invalidEmail;
    }
    if (password.length < 8) {
      return signupCopy.validation.passwordTooShort;
    }
    if (confirmPassword !== password) {
      return signupCopy.validation.passwordMismatch;
    }
    return null;
  }, [confirmPassword, email, fullName, password, signupCopy.validation]);

  if (isAuthReady && isLoggedIn && !isSubmitting) {
    return <Navigate to={ROUTES.catalog} replace />;
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (validationError) {
      notifyError(validationError);
      return;
    }

    setIsSubmitting(true);
    setProgressStep("creatingAccount");

    try {
      setProgressStep("creatingAccount");
      const signupResult = await signupWithCredentials(fullName.trim(), email.trim(), password);

      if (signupResult.profileUpdateFailed) {
        notifyWarning(signupCopy.profileWarningMessage);
      }

      setProgressStep("syncingIdentity");
      const syncResult = await syncRcaIdentity();
      if (!syncResult.success) {
        notifyWarning(signupCopy.syncWarningMessage);
        return;
      }

      if (syncResult.identity) {
        setProgressStep("creatingDefaultQuote");
        const defaultQuoteResult = await initializeDefaultQuote(syncResult.identity);
        if (!defaultQuoteResult.success) {
          notifyWarning(signupCopy.defaultQuoteWarningMessage);
        }
      }

      try {
        setProgressStep("evaluatingDecision");
        const decision = await evaluateDecision();
        setDecisionSession(decision);
      } catch {
        clearDecisionSession();
        notifyWarning(signupCopy.decisionWarningMessage);
      }

      setProgressStep("finalizing");
      navigate(ROUTES.catalog, { replace: true });
    } catch (error) {
      notifyError(error instanceof Error ? error.message : signupCopy.fallbackErrorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthShell
      panelTitle={signupCopy.panelTitle}
      panelSubtitle={signupCopy.panelSubtitle}
      valuePills={signupCopy.valuePills}
      actionTitle={signupCopy.actionTitle}
      actionSubtitle={signupCopy.actionSubtitle}
    >
      <Stack spacing={5}>
        <Stack
          component="form"
          spacing={2}
          onSubmit={handleSubmit}
          noValidate
          sx={{
            p: { xs: 0.5, md: 0 },
            mt: 1.5,
          }}
        >
          <AuthTextField
            label="Full name"
            name="fullName"
            autoComplete="name"
            value={fullName}
            disabled={isSubmitting}
            onChange={(event) => setFullName(event.target.value)}
          />
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
            autoComplete="new-password"
            value={password}
            disabled={isSubmitting}
            onChange={(event) => setPassword(event.target.value)}
          />
          <AuthTextField
            label="Confirm password"
            type="password"
            name="confirmPassword"
            autoComplete="new-password"
            value={confirmPassword}
            disabled={isSubmitting}
            onChange={(event) => setConfirmPassword(event.target.value)}
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
            {signupCopy.submitLabel}
          </Button>

          {isSubmitting ? <AuthProgressStatus active label={progressLabel} /> : null}
        </Stack>

        <Box sx={{ display: "flex", justifyContent: "center", pt: 0.5 }}>
          <Button component={RouterLink} to={ROUTES.login} size="small" color="inherit" disabled={isSubmitting}>
            {signupCopy.loginCta}
          </Button>
        </Box>
      </Stack>
    </AuthShell>
  );
}
