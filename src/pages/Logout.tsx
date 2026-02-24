import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import { Button, Stack, Typography } from "@mui/material";
import { useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import AuthShell from "../components/ui/AuthShell";
import { AUTH_COPY } from "../constants/authContent";
import { ROUTES } from "../constants/routes";
import { useAuth } from "../context/useAuth";
import { useNotification } from "../context/useNotification";

export default function Logout() {
  const logoutCopy = AUTH_COPY.logout;
  const { isLoggedIn, logout } = useAuth();
  const { notifyError, notifySuccess } = useNotification();
  const [signedOut, setSignedOut] = useState(false);

  const handleSignOut = async () => {
    try {
      await logout();
      notifySuccess(logoutCopy.postSignedOut.alertMessage);
      setSignedOut(true);
    } catch (error) {
      const message = error instanceof Error ? error.message : logoutCopy.postSignedOut.errorMessage;
      notifyError(message);
    }
  };

  if (!isLoggedIn && !signedOut) {
    return (
      <AuthShell
        panelTitle={logoutCopy.preSignedOut.panelTitle}
        panelSubtitle={logoutCopy.preSignedOut.panelSubtitle}
        valuePills={logoutCopy.preSignedOut.valuePills}
        actionTitle={logoutCopy.preSignedOut.actionTitle}
        actionSubtitle={logoutCopy.preSignedOut.actionSubtitle}
      >
        <Stack spacing={1.5}>
          <Button
            component={RouterLink}
            to={ROUTES.login}
            variant="contained"
            size="large"
            sx={{ py: 1.2 }}
          >
            {logoutCopy.actions.goToLogin}
          </Button>
          <Button component={RouterLink} to={ROUTES.home} variant="outlined" size="large" sx={{ py: 1.2 }}>
            {logoutCopy.actions.backToHome}
          </Button>
        </Stack>
      </AuthShell>
    );
  }

  if (signedOut) {
    return (
      <AuthShell
        panelTitle={logoutCopy.postSignedOut.panelTitle}
        panelSubtitle={logoutCopy.postSignedOut.panelSubtitle}
        valuePills={logoutCopy.postSignedOut.valuePills}
        actionTitle={logoutCopy.postSignedOut.actionTitle}
        actionSubtitle={logoutCopy.postSignedOut.actionSubtitle}
      >
        <Stack spacing={1.5}>
          <Button
            component={RouterLink}
            to={ROUTES.login}
            variant="contained"
            size="large"
            sx={{ py: 1.2 }}
          >
            {logoutCopy.actions.signInAgain}
          </Button>
          <Button component={RouterLink} to={ROUTES.home} variant="outlined" size="large" sx={{ py: 1.2 }}>
            {logoutCopy.actions.backToHome}
          </Button>
        </Stack>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      panelTitle={logoutCopy.confirmSignOut.panelTitle}
      panelSubtitle={logoutCopy.confirmSignOut.panelSubtitle}
      valuePills={logoutCopy.confirmSignOut.valuePills}
      actionTitle={logoutCopy.confirmSignOut.actionTitle}
      actionSubtitle={logoutCopy.confirmSignOut.actionSubtitle}
    >
      <Stack spacing={2.5}>
        <Typography color="text.secondary" variant="body1">
          {logoutCopy.confirmSignOut.helperText}
        </Typography>
        <Button
          onClick={handleSignOut}
          variant="contained"
          color="primary"
          size="large"
          startIcon={<LogoutOutlinedIcon />}
          sx={{ py: 1.2 }}
        >
          {logoutCopy.confirmSignOut.confirmButtonLabel}
        </Button>
        <Button component={RouterLink} to={ROUTES.catalog} variant="outlined" size="large" sx={{ py: 1.2 }}>
          {logoutCopy.confirmSignOut.staySignedInLabel}
        </Button>
      </Stack>
    </AuthShell>
  );
}
