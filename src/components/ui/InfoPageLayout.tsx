import { ArrowForwardRounded } from "@mui/icons-material";
import { Box, Button, Chip, Paper, Stack, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { Link as RouterLink } from "react-router-dom";

type InfoSection = {
  title: string;
  body: string;
};

type QuickLink = {
  label: string;
  to: string;
};

type InfoPageLayoutProps = {
  title: string;
  subtitle: string;
  lastUpdatedLabel: string;
  lastUpdatedValue: string;
  quickLinksTitle: string;
  sections: readonly InfoSection[];
  quickLinks: readonly QuickLink[];
};

export default function InfoPageLayout({
  title,
  subtitle,
  lastUpdatedLabel,
  lastUpdatedValue,
  quickLinksTitle,
  sections,
  quickLinks,
}: InfoPageLayoutProps) {
  return (
    <Stack spacing={2}>
      <Paper
        variant="outlined"
        sx={{
          borderRadius: 4,
          p: { xs: 2.5, md: 3.25 },
          borderColor: "divider",
          background: (theme) =>
            `radial-gradient(880px 260px at 0% 0%, ${alpha(theme.palette.primary.main, 0.16)} 0%, ${alpha(theme.palette.background.paper, 0.88)} 63%), radial-gradient(780px 280px at 100% 100%, ${alpha(theme.palette.warning.main, 0.14)} 0%, ${alpha(theme.palette.background.paper, 0.9)} 64%)`,
        }}
      >
        <Stack spacing={1.25}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1}
            alignItems={{ xs: "flex-start", sm: "center" }}
            useFlexGap
          >
            <Typography variant="h4">{title}</Typography>
            <Chip
              size="small"
              label={`${lastUpdatedLabel}: ${lastUpdatedValue}`}
              color="primary"
              variant="outlined"
              sx={{ ml: { sm: "auto" }, alignSelf: { xs: "flex-start", sm: "center" } }}
            />
          </Stack>
          <Typography color="text.secondary" sx={{ maxWidth: 760 }}>
            {subtitle}
          </Typography>
        </Stack>
      </Paper>

      {sections.length > 0 ? (
        <Stack spacing={1.25}>
          {sections.map((section) => (
            <Paper key={section.title} variant="outlined" sx={{ p: { xs: 2.25, md: 2.75 }, borderRadius: 3 }}>
              <Stack spacing={0.75}>
                <Typography variant="h6">{section.title}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {section.body}
                </Typography>
              </Stack>
            </Paper>
          ))}
        </Stack>
      ) : null}

      <Paper variant="outlined" sx={{ p: { xs: 2.25, md: 2.75 }, borderRadius: 3 }}>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={1} alignItems={{ xs: "flex-start", sm: "center" }} useFlexGap>
          <Typography variant="subtitle2">{quickLinksTitle}</Typography>
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", ml: { sm: "auto" } }}>
            {quickLinks.map((link) => (
              <Button
                key={link.to}
                size="small"
                variant="outlined"
                component={RouterLink}
                to={link.to}
                endIcon={<ArrowForwardRounded fontSize="small" />}
              >
                {link.label}
              </Button>
            ))}
          </Box>
        </Stack>
      </Paper>
    </Stack>
  );
}
