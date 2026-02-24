import { EmailRounded, GppGoodRounded, ScheduleRounded, SendRounded } from "@mui/icons-material";
import { Button, Divider, MenuItem, Paper, Stack, TextField, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { Link as RouterLink } from "react-router-dom";
import { PRODUCT_COPY } from "../constants/productContent";
import { ROUTES } from "../constants/routes";

export default function Contact() {
  const legalCopy = PRODUCT_COPY.legal;
  const pageCopy = legalCopy.contact;
  const formCopy = pageCopy.form;
  const supportPanelCopy = pageCopy.supportPanel;
  const supportEmail =
    pageCopy.sections.find((section) => section.title === "Support email")?.body ?? "support@react-rca.dev";
  const businessHours =
    pageCopy.sections.find((section) => section.title === "Business hours")?.body ??
    "Monday to Friday, 9:00 AM to 6:00 PM (local business time).";
  const responseTime =
    pageCopy.sections.find((section) => section.title === "Typical response time")?.body ??
    "Most requests receive a response within one business day.";

  return (
    <Stack spacing={2}>
      <Paper
        variant="outlined"
        sx={{
          borderRadius: 4,
          p: { xs: 2.5, md: 3.25 },
          background: (theme) =>
            `radial-gradient(840px 240px at 8% 0%, ${alpha(theme.palette.primary.light, 0.18)} 0%, ${alpha(theme.palette.background.paper, 0.9)} 64%), radial-gradient(760px 220px at 100% 100%, ${alpha(theme.palette.info.main, 0.12)} 0%, ${alpha(theme.palette.background.paper, 0.95)} 66%)`,
        }}
      >
        <Stack spacing={1.25}>
          <Typography variant="h4">{pageCopy.pageTitle}</Typography>
          <Typography color="text.secondary" sx={{ maxWidth: 740 }}>
            {pageCopy.pageSubtitle}
          </Typography>
        </Stack>
      </Paper>

      <Stack direction={{ xs: "column", md: "row" }} spacing={2} useFlexGap alignItems="stretch">
        <Paper
          variant="outlined"
          sx={{
            borderRadius: 3,
            p: { xs: 2.25, md: 2.75 },
            flex: 1,
          }}
        >
          <Stack spacing={2}>
            <Typography variant="h6">{formCopy.cardTitle}</Typography>
            <Typography variant="body2" color="text.secondary">
              {formCopy.cardSubtitle}
            </Typography>
            <TextField fullWidth label={formCopy.fullNameLabel} />
            <TextField fullWidth type="email" label={formCopy.workEmailLabel} />
            <TextField fullWidth select label={formCopy.topicLabel} defaultValue={formCopy.topicOptions[0]}>
              {formCopy.topicOptions.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </TextField>
            <TextField fullWidth multiline minRows={5} label={formCopy.messageLabel} />
            <Typography variant="caption" color="text.secondary">
              {formCopy.consentNote}
            </Typography>
            <Button variant="contained" startIcon={<SendRounded />} sx={{ alignSelf: "flex-start" }}>
              {formCopy.submitLabel}
            </Button>
          </Stack>
        </Paper>

        <Paper
          variant="outlined"
          sx={{
            borderRadius: 3,
            p: { xs: 2.25, md: 2.75 },
            width: { xs: "100%", md: 360 },
            background: (theme) => alpha(theme.palette.info.main, 0.04),
          }}
        >
          <Stack spacing={1.75}>
            <Typography variant="h6">{supportPanelCopy.title}</Typography>
            <Button
              variant="outlined"
              startIcon={<EmailRounded />}
              href={`mailto:${supportEmail}`}
              sx={{ alignSelf: "flex-start" }}
            >
              {supportEmail}
            </Button>
            <Divider />
            <Stack spacing={0.75}>
              <Stack direction="row" spacing={1} alignItems="center">
                <ScheduleRounded color="primary" fontSize="small" />
                <Typography variant="subtitle2">{supportPanelCopy.availabilityTitle}</Typography>
              </Stack>
              <Typography variant="body2" color="text.secondary">
                {businessHours}
              </Typography>
            </Stack>
            <Stack spacing={0.75}>
              <Stack direction="row" spacing={1} alignItems="center">
                <GppGoodRounded color="primary" fontSize="small" />
                <Typography variant="subtitle2">{supportPanelCopy.responseTitle}</Typography>
              </Stack>
              <Typography variant="body2" color="text.secondary">
                {responseTime}
              </Typography>
            </Stack>
            <Button component={RouterLink} to={ROUTES.legal} variant="text" sx={{ alignSelf: "flex-start" }}>
              {supportPanelCopy.legalCtaLabel}
            </Button>
          </Stack>
        </Paper>
      </Stack>
    </Stack>
  );
}
