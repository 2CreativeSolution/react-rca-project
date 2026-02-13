import {
  Box,
  Button,
  Stack,
} from "@mui/material";
import { useState, type FormEvent } from "react";
import { Link as RouterLink, Navigate } from "react-router-dom";
import AuthShell from "../components/ui/AuthShell";
import AuthTextField from "../components/ui/AuthTextField";
import { AUTH_COPY } from "../constants/authContent";
import { ROUTES } from "../constants/routes";
import { useAuth } from "../context/useAuth";
import { useNotification } from "../context/useNotification";


export default function Login() {
  const loginCopy = AUTH_COPY.login;
  const { isAuthReady, isLoggedIn, loginWithCredentials } = useAuth();
  const { notifyError } = useNotification();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  if (isAuthReady && isLoggedIn) {
    return <Navigate to={ROUTES.dashboard} replace />;
  }

  const handleCredentialsSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      await loginWithCredentials(email, password);
    } catch (error) {
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
            onChange={(event) => setEmail(event.target.value)}
          />
          <AuthTextField
            label="Password"
            type="password"
            name="password"
            autoComplete="current-password"
            value={password}
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
        </Stack>

        <Box sx={{ display: "flex", justifyContent: "center", pt: 0.5 }}>
          <Button component={RouterLink} to={ROUTES.signup} size="small" color="inherit">
            {loginCopy.signupCta}
          </Button>
        </Box>
      </Stack>
    </AuthShell>
  );
}
