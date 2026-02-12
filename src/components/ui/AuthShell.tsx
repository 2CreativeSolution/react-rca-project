import type { ReactNode } from "react";
import { Box, Chip, Paper, Stack, Typography } from "@mui/material";

type AuthShellProps = {
  panelTitle: string;
  panelSubtitle: string;
  valuePills?: readonly string[];
  actionTitle?: string;
  actionSubtitle?: string;
  children: ReactNode;
};

export default function AuthShell({
  panelTitle,
  panelSubtitle,
  valuePills = [],
  actionTitle,
  actionSubtitle,
  children,
}: AuthShellProps) {
  return (
    <Box
      sx={{
        border: 1,
        borderColor: "divider",
        borderRadius: 6,
        overflow: "hidden",
        bgcolor: "background.paper",
        boxShadow: "0 28px 72px rgba(15, 23, 42, 0.1)",
      }}
    >
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "minmax(0, 1.3fr) minmax(0, 1fr)" },
        }}
      >
        <Paper
          square
          elevation={0}
          sx={{
            px: { xs: 4, md: 6 },
            py: { xs: 5, md: 7 },
            borderRight: { xs: 0, md: 1 },
            borderBottom: { xs: 1, md: 0 },
            borderColor: "divider",
            bgcolor: "background.default",
            background:
              "radial-gradient(960px 360px at 0% 0%, rgba(37,99,235,0.18) 0%, rgba(250,250,249,0) 60%), radial-gradient(720px 300px at 100% 95%, rgba(249,115,22,0.14) 0%, rgba(250,250,249,0) 58%)",
            position: "relative",
            "&::after": {
              content: '""',
              position: "absolute",
              width: 190,
              height: 190,
              top: 34,
              right: 32,
              borderRadius: "28% 72% 51% 49% / 40% 40% 60% 60%",
              bgcolor: "primary.light",
              opacity: 0.14,
              filter: "blur(1px)",
              pointerEvents: "none",
            },
          }}
        >
          <Stack spacing={4} sx={{ position: "relative", zIndex: 1 }}>
            <Stack spacing={2} sx={{ maxWidth: 520 }}>
              <Typography variant="h3" sx={{ lineHeight: 1.08 }}>
                {panelTitle}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {panelSubtitle}
              </Typography>
            </Stack>

            {valuePills.length > 0 ? (
              <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap", mt: 1 }}>
                {valuePills.map((item) => (
                  <Chip key={item} label={item} color="default" variant="outlined" />
                ))}
              </Box>
            ) : null}
          </Stack>
        </Paper>

        <Box
          sx={{
            px: { xs: 3, md: 4 },
            pt: { xs: 5, md: 8 },
            pb: { xs: 3, md: 5 },
          }}
        >
          <Stack spacing={actionTitle || actionSubtitle ? 1 : 0}>
            {actionTitle ? (
              <Typography variant="h5" sx={{ lineHeight: 1.1, mt: 0.5 }}>
                {actionTitle}
              </Typography>
            ) : null}
            {actionSubtitle ? (
              <Typography variant="body2" color="text.secondary" sx={{ mb: 6 }}>
                {actionSubtitle}
              </Typography>
            ) : null}
          </Stack>
          <Box sx={{ mt: { xs: 2.5, md: 3.5 } }}>{children}</Box>
        </Box>
      </Box>
    </Box>
  );
}
