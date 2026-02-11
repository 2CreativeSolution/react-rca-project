import { Box, Button, Stack } from "@mui/material";
import { useMemo, useState, type FormEvent } from "react";
import { Link as RouterLink, Navigate } from "react-router-dom";
import AuthShell from "../components/ui/AuthShell";
import AuthTextField from "../components/ui/AuthTextField";
import { AUTH_COPY } from "../constants/authContent";
import { ROUTES } from "../constants/routes";
import { useAuth } from "../context/useAuth";
import { useNotification } from "../context/useNotification";

function isEmailValid(email: string) {
  return /\S+@\S+\.\S+/.test(email);
}

export default function Signup() {
  const signupCopy = AUTH_COPY.signup;
  const { isLoggedIn, signupWithCredentials } = useAuth();
  const { notifyError } = useNotification();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

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

  if (isLoggedIn) {
    return <Navigate to={ROUTES.catalog} replace />;
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (validationError) {
      notifyError(validationError);
      return;
    }

    try {
      signupWithCredentials(fullName.trim(), email.trim(), password);
    } catch (error) {
      notifyError(error instanceof Error ? error.message : signupCopy.fallbackErrorMessage);
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
            onChange={(event) => setFullName(event.target.value)}
          />
          <AuthTextField
            label="Email"
            type="email"
            name="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
          <AuthTextField
            label="Password"
            type="password"
            name="password"
            autoComplete="new-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
          <AuthTextField
            label="Confirm password"
            type="password"
            name="confirmPassword"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
          />

          <Button
            type="submit"
            variant="contained"
            size="large"
            sx={{
              py: 1.25,
              borderRadius: 3,
              fontWeight: 800,
            }}
          >
            {signupCopy.submitLabel}
          </Button>
        </Stack>

        <Box sx={{ display: "flex", justifyContent: "center", pt: 0.5 }}>
          <Button component={RouterLink} to={ROUTES.login} size="small" color="inherit">
            {signupCopy.loginCta}
          </Button>
        </Box>
      </Stack>
    </AuthShell>
  );
}
