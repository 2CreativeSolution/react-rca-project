import { Paper, Stack, Typography } from "@mui/material";
import type { ReactNode } from "react";

type SettingsSectionCardProps = {
  icon: ReactNode;
  title: string;
  children: ReactNode;
};

export function SettingsSectionCard({ icon, title, children }: SettingsSectionCardProps) {
  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2.25,
        borderRadius: 3,
        height: "100%",
        bgcolor: "background.paper",
        boxShadow: 1,
      }}
    >
      <Stack spacing={1.75}>
        <Stack direction="row" spacing={1} alignItems="center">
          {icon}
          <Typography variant="h6">{title}</Typography>
        </Stack>
        {children}
      </Stack>
    </Paper>
  );
}
