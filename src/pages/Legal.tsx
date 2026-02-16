import { Paper, Stack, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import InfoPageLayout from "../components/ui/InfoPageLayout";
import { PRODUCT_COPY } from "../constants/productContent";
import { ROUTES } from "../constants/routes";

export default function Legal() {
  const legalCopy = PRODUCT_COPY.legal;
  const privacyCopy = legalCopy.privacy;
  const termsCopy = legalCopy.terms;

  return (
    <Stack spacing={2}>
      <InfoPageLayout
        title={legalCopy.pageTitle}
        subtitle={legalCopy.pageSubtitle}
        lastUpdatedLabel={legalCopy.lastUpdatedLabel}
        lastUpdatedValue={privacyCopy.lastUpdated}
        quickLinksTitle={legalCopy.quickLinksTitle}
        sections={[]}
        quickLinks={[{ label: PRODUCT_COPY.settings.contactLinkLabel, to: ROUTES.contact }]}
      />

      <Paper
        id="privacy"
        variant="outlined"
        sx={{
          p: { xs: 2.25, md: 2.75 },
          borderRadius: 3,
          scrollMarginTop: 96,
          background: (theme) => alpha(theme.palette.primary.main, 0.02),
        }}
      >
        <Stack spacing={1.25}>
          <Typography variant="h5">{legalCopy.privacySectionTitle}</Typography>
          {privacyCopy.sections.map((section) => (
            <Stack key={section.title} spacing={0.5}>
              <Typography variant="subtitle1">{section.title}</Typography>
              <Typography variant="body2" color="text.secondary">
                {section.body}
              </Typography>
            </Stack>
          ))}
        </Stack>
      </Paper>

      <Paper
        id="terms"
        variant="outlined"
        sx={{
          p: { xs: 2.25, md: 2.75 },
          borderRadius: 3,
          scrollMarginTop: 96,
          background: (theme) => alpha(theme.palette.warning.main, 0.05),
        }}
      >
        <Stack spacing={1.25}>
          <Typography variant="h5">{legalCopy.termsSectionTitle}</Typography>
          {termsCopy.sections.map((section) => (
            <Stack key={section.title} spacing={0.5}>
              <Typography variant="subtitle1">{section.title}</Typography>
              <Typography variant="body2" color="text.secondary">
                {section.body}
              </Typography>
            </Stack>
          ))}
        </Stack>
      </Paper>
    </Stack>
  );
}
