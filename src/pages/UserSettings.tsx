import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import ExpandMoreOutlinedIcon from "@mui/icons-material/ExpandMoreOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import LockResetOutlinedIcon from "@mui/icons-material/LockResetOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import PendingActionsOutlinedIcon from "@mui/icons-material/PendingActionsOutlined";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import PhotoCameraOutlinedIcon from "@mui/icons-material/PhotoCameraOutlined";
import SecurityOutlinedIcon from "@mui/icons-material/SecurityOutlined";
import SyncProblemOutlinedIcon from "@mui/icons-material/SyncProblemOutlined";
import VerifiedUserOutlinedIcon from "@mui/icons-material/VerifiedUserOutlined";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Avatar,
  Button,
  Chip,
  Divider,
  Grid,
  Paper,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { useMemo, useRef, useState, type ChangeEvent } from "react";
import { Link as RouterLink, Navigate } from "react-router-dom";
import { ReadOnlyField } from "../components/settings/ReadOnlyField";
import { SettingsSectionCard } from "../components/settings/SettingsSectionCard";
import { PRODUCT_COPY } from "../constants/productContent";
import { ROUTES } from "../constants/routes";
import { useAuth } from "../context/useAuth";
import { useNotification } from "../context/useNotification";

function formatIsoTimestamp(value: string | null, fallback: string): string {
  if (!value) {
    return fallback;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return fallback;
  }

  return date.toLocaleString();
}

export default function UserSettings() {
  const settingsCopy = PRODUCT_COPY.settings;
  const {
    isAuthReady,
    isLoggedIn,
    currentUser,
    profilePhotoUrl,
    requestPasswordReset,
    logout,
    rcaSyncStatus,
    decisionSession,
    retryRcaSync,
    uploadProfilePhoto,
    removeProfilePhoto,
  } = useAuth();
  const { notifyError, notifySuccess } = useNotification();
  const photoInputRef = useRef<HTMLInputElement | null>(null);
  const [isSendingReset, setIsSendingReset] = useState(false);
  const [isRetryingSync, setIsRetryingSync] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [isRemovingPhoto, setIsRemovingPhoto] = useState(false);
  const [photoValidationError, setPhotoValidationError] = useState<string | null>(null);

  const accountEmail = currentUser?.email?.trim() ?? "";
  const providerId = currentUser?.providerData[0]?.providerId ?? settingsCopy.unavailableValue;
  const photoURL = profilePhotoUrl ?? "";
  const isPhotoBusy = isUploadingPhoto || isRemovingPhoto;

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

  const syncStatusLabel =
    rcaSyncStatus.state === "failed"
      ? settingsCopy.syncStateFailedLabel
      : rcaSyncStatus.state === "synced"
        ? settingsCopy.syncStateSyncedLabel
        : settingsCopy.syncStateUnknownLabel;

  const syncStatusMessage =
    rcaSyncStatus.state === "failed"
      ? settingsCopy.syncFailedMessage
      : rcaSyncStatus.state === "synced"
        ? settingsCopy.syncSuccessMessage
        : settingsCopy.syncUnknownMessage;

  const decisionItems = [
    { label: settingsCopy.activeQuoteLabel, isActive: decisionSession.isActiveQuote },
    { label: settingsCopy.activeOrderLabel, isActive: decisionSession.isActiveOrder },
    { label: settingsCopy.activeAssetLabel, isActive: decisionSession.isActiveAsset },
  ];

  const syncDetails = [
    {
      label: settingsCopy.lastAttemptLabel,
      value: formatIsoTimestamp(rcaSyncStatus.lastAttemptAt, settingsCopy.unavailableValue),
    },
    {
      label: settingsCopy.lastSuccessLabel,
      value: formatIsoTimestamp(rcaSyncStatus.lastSuccessAt, settingsCopy.unavailableValue),
    },
    {
      label: settingsCopy.lastFailureLabel,
      value: formatIsoTimestamp(rcaSyncStatus.lastFailedAt, settingsCopy.unavailableValue),
    },
  ];

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

  const handleRetrySync = async () => {
    setIsRetryingSync(true);
    try {
      const didSucceed = await retryRcaSync();
      if (didSucceed) {
        notifySuccess(settingsCopy.retrySyncSuccessMessage);
      } else {
        notifyError(settingsCopy.retrySyncFallbackErrorMessage);
      }
    } finally {
      setIsRetryingSync(false);
    }
  };

  const handleUploadPhoto = async (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    event.target.value = "";

    if (!selectedFile) {
      return;
    }

    setPhotoValidationError(null);
    setIsUploadingPhoto(true);

    try {
      await uploadProfilePhoto(selectedFile);
      notifySuccess(settingsCopy.uploadPhotoSuccessMessage);
    } catch (error) {
      const message = error instanceof Error ? error.message : settingsCopy.uploadPhotoFallbackErrorMessage;
      setPhotoValidationError(message);
      notifyError(message);
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleRemovePhoto = async () => {
    setPhotoValidationError(null);
    setIsRemovingPhoto(true);

    try {
      await removeProfilePhoto();
      notifySuccess(settingsCopy.removePhotoSuccessMessage);
    } catch (error) {
      const message = error instanceof Error ? error.message : settingsCopy.removePhotoFallbackErrorMessage;
      setPhotoValidationError(message);
      notifyError(message);
    } finally {
      setIsRemovingPhoto(false);
    }
  };

  return (
    <Stack spacing={2.25} sx={{ py: 1.5 }}>
      <Paper variant="outlined" sx={{ p: { xs: 2.25, md: 2.75 }, borderRadius: 4, borderColor: "divider" }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
          <Stack spacing={0.4}>
            <Typography variant="h4">{settingsCopy.pageTitle}</Typography>
            <Typography color="text.secondary">{settingsCopy.pageSubtitle}</Typography>
          </Stack>
          <Chip
            icon={<VerifiedUserOutlinedIcon />}
            label={settingsCopy.signedInStatus}
            color="success"
            variant="outlined"
            sx={{ alignSelf: "center" }}
          />
        </Stack>
      </Paper>

      <SettingsSectionCard
        icon={<PersonOutlineOutlinedIcon color="action" fontSize="small" />}
        title={settingsCopy.accountSectionTitle}
        sx={{
          position: "relative",
          overflow: "hidden",
          background: (theme) =>
            `radial-gradient(720px 200px at 8% 0%, ${alpha(theme.palette.info.main, 0.16)} 0%, ${alpha(theme.palette.background.paper, 0.92)} 68%), radial-gradient(700px 220px at 100% 100%, ${alpha(theme.palette.warning.main, 0.14)} 0%, ${alpha(theme.palette.background.paper, 0.94)} 72%)`,
        }}
      >
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 4 }}>
            <Stack spacing={1.5} alignItems="flex-start">
              <Avatar
                src={photoURL || undefined}
                alt={settingsCopy.profilePhotoAlt}
                sx={{ width: 92, height: 92, bgcolor: "primary.main", fontWeight: 700 }}
              >
                {(profileValues.displayName[0] ?? "U").toUpperCase()}
              </Avatar>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                <Button
                  variant="contained"
                  startIcon={<PhotoCameraOutlinedIcon />}
                  onClick={() => photoInputRef.current?.click()}
                  disabled={isPhotoBusy}
                >
                  {settingsCopy.uploadPhotoCta}
                </Button>
                <Button
                  variant="outlined"
                  color="inherit"
                  startIcon={<DeleteOutlineOutlinedIcon />}
                  onClick={() => void handleRemovePhoto()}
                  disabled={isPhotoBusy || !photoURL}
                >
                  {settingsCopy.removePhotoCta}
                </Button>
              </Stack>
              <input
                ref={photoInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                aria-label={settingsCopy.profilePhotoInputAriaLabel}
                style={{ display: "none" }}
                onChange={handleUploadPhoto}
              />
              {photoValidationError ? <Alert severity="error">{photoValidationError}</Alert> : null}
            </Stack>
          </Grid>

          <Grid size={{ xs: 12, md: 8 }}>
            <Stack
              spacing={1.5}
              sx={{
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 2.5,
                p: { xs: 1.75, sm: 2 },
                bgcolor: "background.paper",
              }}
            >
              <Typography variant="caption" color="text.secondary">
                {settingsCopy.displayNameLabel}
              </Typography>
              <Typography variant="h5" sx={{ lineHeight: 1.2 }}>
                {profileValues.displayName}
              </Typography>
              <Divider />
              <Typography variant="caption" color="text.secondary">
                {settingsCopy.emailLabel}
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                {profileValues.email}
              </Typography>
            </Stack>
          </Grid>
        </Grid>
      </SettingsSectionCard>

      <SettingsSectionCard icon={<SecurityOutlinedIcon color="action" fontSize="small" />} title={settingsCopy.securityAccessSectionTitle}>
        <Stack spacing={1.5}>
          <Stack spacing={0.5}>
            <Typography variant="subtitle2">{settingsCopy.resetPasswordTitle}</Typography>
            <Typography variant="body2" color="text.secondary">
              {accountEmail ? settingsCopy.resetPasswordHelper : settingsCopy.resetPasswordMissingEmailMessage}
            </Typography>
            <Button
              variant="contained"
              startIcon={<LockResetOutlinedIcon />}
              onClick={() => void handleSendResetEmail()}
              disabled={isSendingReset || !accountEmail}
              sx={{ alignSelf: "flex-start" }}
            >
              {settingsCopy.resetPasswordCta}
            </Button>
          </Stack>

          <Divider />

          <Stack spacing={0.5}>
            <Typography variant="subtitle2">{settingsCopy.signOutTitle}</Typography>
            <Typography variant="body2" color="text.secondary">
              {settingsCopy.signOutHelper}
            </Typography>
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
          </Stack>
        </Stack>
      </SettingsSectionCard>

      <SettingsSectionCard icon={<SyncProblemOutlinedIcon color="action" fontSize="small" />} title={settingsCopy.syncSectionTitle}>
        <Stack spacing={1.2}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Typography variant="subtitle2">{settingsCopy.statusLabel}</Typography>
            <Chip
              size="small"
              label={syncStatusLabel}
              color={rcaSyncStatus.state === "failed" ? "warning" : rcaSyncStatus.state === "synced" ? "success" : "default"}
              variant="outlined"
            />
          </Stack>

          <Typography variant="body2" color="text.secondary">
            {syncStatusMessage}
          </Typography>

          <Grid container spacing={1}>
            {syncDetails.map((item) => (
              <Grid key={item.label} size={{ xs: 12, sm: 4 }}>
                <ReadOnlyField label={item.label} value={item.value} />
              </Grid>
            ))}
          </Grid>

          <Button
            variant="outlined"
            onClick={() => void handleRetrySync()}
            disabled={isRetryingSync}
            sx={{ alignSelf: "flex-start" }}
          >
            {settingsCopy.retrySyncCta}
          </Button>
        </Stack>
      </SettingsSectionCard>

      <SettingsSectionCard
        icon={<PendingActionsOutlinedIcon color="action" fontSize="small" />}
        title={settingsCopy.advancedDiagnosticsSectionTitle}
      >
        <Accordion
          disableGutters
          elevation={0}
          sx={{
            "&::before": {
              display: "none",
            },
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 2,
            "& .MuiAccordionSummary-root": {
              borderBottom: "1px solid",
              borderBottomColor: "divider",
              minHeight: 52,
            },
            "& .MuiAccordionSummary-root.Mui-expanded": {
              minHeight: 52,
            },
            "& .MuiAccordionDetails-root": {
              pt: 1.5,
            },
          }}
        >
          <AccordionSummary expandIcon={<ExpandMoreOutlinedIcon />}>
            <Typography variant="subtitle2">{settingsCopy.advancedDiagnosticsAccordionTitle}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Stack spacing={1.25}>
              <Grid container spacing={1}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <ReadOnlyField label={settingsCopy.userIdLabel} value={profileValues.userId} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <ReadOnlyField label={settingsCopy.providerLabel} value={profileValues.provider} />
                </Grid>
              </Grid>

              <Stack spacing={1}>
                <Typography variant="subtitle2">{settingsCopy.decisionSectionTitle}</Typography>
                {decisionItems.map((item) => (
                  <Stack key={item.label} direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
                    <Typography variant="body2">{item.label}</Typography>
                    <Chip
                      size="small"
                      label={item.isActive ? settingsCopy.decisionActiveLabel : settingsCopy.decisionInactiveLabel}
                      color={item.isActive ? "success" : "default"}
                      variant="outlined"
                    />
                  </Stack>
                ))}
              </Stack>

              <ReadOnlyField
                label={settingsCopy.lastErrorLabel}
                value={rcaSyncStatus.lastErrorMessage ?? settingsCopy.unavailableValue}
              />
            </Stack>
          </AccordionDetails>
        </Accordion>
      </SettingsSectionCard>

      <SettingsSectionCard icon={<InfoOutlinedIcon color="action" fontSize="small" />} title={settingsCopy.appInfoSectionTitle}>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} alignItems={{ sm: "center" }}>
          <Chip variant="outlined" label={`${settingsCopy.versionLabel}: ${appVersion}`} />
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
