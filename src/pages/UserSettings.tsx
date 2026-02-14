import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import LockResetOutlinedIcon from "@mui/icons-material/LockResetOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import SecurityOutlinedIcon from "@mui/icons-material/SecurityOutlined";
import VerifiedUserOutlinedIcon from "@mui/icons-material/VerifiedUserOutlined";
import { Avatar, Button, Chip, Grid, Paper, Skeleton, Stack, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { useMemo, useState } from "react";
import { Link as RouterLink, Navigate } from "react-router-dom";
import { ReadOnlyField } from "../components/settings/ReadOnlyField";
import { SettingsSectionCard } from "../components/settings/SettingsSectionCard";
import { PRODUCT_COPY } from "../constants/productContent";
import { ROUTES } from "../constants/routes";
import { useAuth } from "../context/useAuth";
import { useNotification } from "../context/useNotification";

export default function UserSettings() {
  const settingsCopy = PRODUCT_COPY.settings;
  const { isAuthReady, isLoggedIn, currentUser, requestPasswordReset, logout } = useAuth();
  const { notifyError, notifySuccess } = useNotification();
  const [isSendingReset, setIsSendingReset] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const accountEmail = currentUser?.email?.trim() ?? "";
  const providerId = currentUser?.providerData[0]?.providerId ?? settingsCopy.unavailableValue;

  const profileValues = useMemo(
    () => ({
      displayName: currentUser?.displayName?.trim() || settingsCopy.unavailableValue,
      email: accountEmail || settingsCopy.unavailableValue,
      provider: providerId,
      userId: currentUser?.uid || settingsCopy.unavailableValue,
    }),
    [accountEmail, currentUser?.displayName, currentUser?.uid, providerId, settingsCopy.unavailableValue]
  );

  const appVersion = import.meta.env.VITE_APP_VERSION?.trim() || "0.0.0";

  const handleSendResetEmail = async () => {
    if (!accountEmail) {
      notifyError(settingsCopy.resetPasswordMissingEmailMessage);
      return;
    }

    setIsSendingReset(true);
    try {
      await requestPasswordReset(accountEmail);
      notifySuccess(settingsCopy.resetPasswordSuccessMessage);
    } catch (error) {
      notifyError(error instanceof Error ? error.message : settingsCopy.resetPasswordFallbackErrorMessage);
    } finally {
      setIsSendingReset(false);
    }
  };

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await logout();
      notifySuccess(settingsCopy.signOutSuccessMessage);
    } catch (error) {
      notifyError(error instanceof Error ? error.message : settingsCopy.signOutFallbackErrorMessage);
    } finally {
      setIsSigningOut(false);
    }
  };

  if (!isAuthReady) {
    return (
      <Stack spacing={2.5} sx={{ py: 1.5 }}>
        <Skeleton variant="text" width={220} height={54} />
        <Skeleton variant="rounded" height={200} />
        <Skeleton variant="rounded" height={170} />
      </Stack>
    );
  }

  if (!isLoggedIn) {
    return <Navigate to={ROUTES.login} replace />;
  }

  return (
    <Stack spacing={2.25} sx={{ py: 1.5 }}>
      <Paper
        variant="outlined"
        sx={{
          p: { xs: 2.25, md: 2.75 },
          borderRadius: 4,
          overflow: "hidden",
          position: "relative",
          borderColor: "divider",
          background: (theme) =>
            `radial-gradient(800px 280px at 10% 0%, ${alpha(theme.palette.info.main, 0.18)} 0%, ${alpha(theme.palette.background.paper, 0.85)} 62%), radial-gradient(760px 240px at 100% 100%, ${alpha(theme.palette.warning.main, 0.16)} 0%, ${alpha(theme.palette.background.paper, 0.88)} 65%)`,
          "&::after": {
            content: "\"\"",
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            boxShadow: (theme) => `inset 0 1px 0 ${alpha(theme.palette.common.white, 0.8)}`,
          },
        }}
      >
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="flex-start"
          spacing={2}
          sx={{ position: "relative", zIndex: 1 }}
        >
          <Stack direction="row" spacing={1.5} alignItems="center" sx={{ minWidth: 0 }}>
            <Avatar sx={{ width: 54, height: 54, bgcolor: "primary.main", fontWeight: 700 }}>
              {(profileValues.displayName[0] ?? "U").toUpperCase()}
            </Avatar>
            <Stack spacing={0.35} sx={{ minWidth: 0 }}>
              <Typography variant="h4">{settingsCopy.pageTitle}</Typography>
              <Typography color="text.secondary">{settingsCopy.pageSubtitle}</Typography>
            </Stack>
          </Stack>
          <Chip
            icon={<VerifiedUserOutlinedIcon />}
            label={settingsCopy.signedInStatus}
            color="success"
            variant="outlined"
            sx={{ ml: 1, alignSelf: "center", px: 0.6, py: 0.35 }}
          />
        </Stack>
      </Paper>

      <Grid container spacing={1.75}>
        <Grid size={{ xs: 12, lg: 7 }}>
          <SettingsSectionCard
            icon={<PersonOutlineOutlinedIcon color="action" fontSize="small" />}
            title={settingsCopy.profileSectionTitle}
          >
            <Grid container spacing={1.25}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <ReadOnlyField label={settingsCopy.displayNameLabel} value={profileValues.displayName} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <ReadOnlyField label={settingsCopy.emailLabel} value={profileValues.email} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <ReadOnlyField label={settingsCopy.providerLabel} value={profileValues.provider} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <ReadOnlyField label={settingsCopy.userIdLabel} value={profileValues.userId} />
              </Grid>
            </Grid>
          </SettingsSectionCard>
        </Grid>

        <Grid size={{ xs: 12, lg: 5 }}>
          <Stack spacing={1.75} sx={{ height: "100%" }}>
            <SettingsSectionCard
              icon={<SecurityOutlinedIcon color="action" fontSize="small" />}
              title={settingsCopy.securitySectionTitle}
            >
              <Stack spacing={0.5}>
                <Typography variant="subtitle2">{settingsCopy.resetPasswordTitle}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {accountEmail ? settingsCopy.resetPasswordHelper : settingsCopy.resetPasswordMissingEmailMessage}
                </Typography>
              </Stack>
              <Button
                variant="contained"
                startIcon={<LockResetOutlinedIcon />}
                onClick={() => void handleSendResetEmail()}
                disabled={isSendingReset || !accountEmail}
                sx={{ alignSelf: "flex-start" }}
              >
                {settingsCopy.resetPasswordCta}
              </Button>
            </SettingsSectionCard>

            <SettingsSectionCard
              icon={<LogoutOutlinedIcon color="action" fontSize="small" />}
              title={settingsCopy.sessionSectionTitle}
            >
              <Button
                variant="outlined"
                color="error"
                startIcon={<LogoutOutlinedIcon />}
                onClick={() => void handleSignOut()}
                disabled={isSigningOut}
                sx={{ alignSelf: "flex-start" }}
              >
                {settingsCopy.signOutCta}
              </Button>
            </SettingsSectionCard>
          </Stack>
        </Grid>
      </Grid>

      <SettingsSectionCard
        icon={<InfoOutlinedIcon color="action" fontSize="small" />}
        title={settingsCopy.appInfoSectionTitle}
      >
        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} alignItems={{ sm: "center" }}>
          <ReadOnlyField label={settingsCopy.versionLabel} value={appVersion} />
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ ml: { sm: "auto" } }}>
            <Button size="small" variant="outlined" component={RouterLink} to={ROUTES.legal}>
              {settingsCopy.legalLinkLabel}
            </Button>
            <Button size="small" variant="outlined" component={RouterLink} to={ROUTES.contact}>
              {settingsCopy.contactLinkLabel}
            </Button>
          </Stack>
        </Stack>
      </SettingsSectionCard>
    </Stack>
  );
}
