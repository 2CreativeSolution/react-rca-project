import { Paper, Stack, Typography } from "@mui/material";
import type { SxProps, Theme } from "@mui/material/styles";
import type { ReactNode } from "react";

type SettingsSectionCardProps = {
  icon: ReactNode;
  title: string;
  children: ReactNode;
  sx?: SxProps<Theme>;
};

export function SettingsSectionCard({ icon, title, children, sx }: SettingsSectionCardProps) {
  return (
    <Paper
      variant="outlined"
      sx={[
        {
          p: { xs: 2.5, md: 2.75 },
          borderRadius: 3,
          height: "100%",
          bgcolor: "background.paper",
          boxShadow: 1,
        },
        ...(Array.isArray(sx) ? sx : sx ? [sx] : []),
      ]}
    >
      <Stack spacing={2}>
        <Stack direction="row" spacing={1} alignItems="center">
          {icon}
          <Typography variant="h6">{title}</Typography>
        </Stack>
        {children}
      </Stack>
    </Paper>
  );
}
