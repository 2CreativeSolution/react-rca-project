import LoginIcon from "@mui/icons-material/Login";
import {
  Box,
  Button,
  Divider,
  Stack,
} from "@mui/material";
import { useMemo, useState, type FormEvent } from "react";
import { Link as RouterLink, Navigate } from "react-router-dom";
import { CLIENT_ID } from "../auth/salesforceConfig";
import { loginWithSalesforce } from "../auth/salesforceLogin";
import AuthShell from "../components/ui/AuthShell";
import AuthTextField from "../components/ui/AuthTextField";
import { AUTH_COPY } from "../constants/authContent";
import { ROUTES } from "../constants/routes";
import { useAuth } from "../context/useAuth";
import { useNotification } from "../context/useNotification";


export default function Login() {
  const loginCopy = AUTH_COPY.login;
  const { isLoggedIn, loginWithCredentials } = useAuth();
  const { notifyError, notifyWarning } = useNotification();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const isSalesforceConfigured = useMemo(
    () => CLIENT_ID.trim().length > 0 && CLIENT_ID !== "PASTE_CONNECTED_APP_CONSUMER_KEY",
    []
  );

  if (isLoggedIn) {
    return <Navigate to={ROUTES.catalog} replace />;
  }

  const handleSalesforceLogin = () => {
    if (!isSalesforceConfigured) {
      notifyWarning(loginCopy.missingClientIdMessage);
      return;
    }

    setIsSubmitting(true);
    loginWithSalesforce();
  };

  const handleCredentialsSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      loginWithCredentials(email, password);
    } catch (error) {
      notifyError(error instanceof Error ? error.message : loginCopy.credentialErrorMessage);
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
            sx={{
              py: 1.25,
              borderRadius: 3,
              fontWeight: 800,
            }}
          >
            {loginCopy.submitLabel}
          </Button>
        </Stack>

        <Divider sx={{ color: "text.secondary", my: 2 }}>{loginCopy.salesforceSectionLabel}</Divider>

        <Stack spacing={1.25} sx={{ mt: 1.5 }}>
          <Button
            onClick={handleSalesforceLogin}
            variant="contained"
            size="large"
            startIcon={<LoginIcon />}
            disabled={isSubmitting}
            sx={{
              py: 1.15,
              borderRadius: 3,
              bgcolor: "secondary.main",
              color: "background.paper",
              "&:hover": {
                bgcolor: "text.primary",
              },
            }}
          >
            {loginCopy.salesforceLabel}
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
