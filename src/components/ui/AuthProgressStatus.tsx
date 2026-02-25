import { CircularProgress, Stack, Typography } from "@mui/material";
import { useEffect, useMemo, useState } from "react";

type AuthProgressStatusProps = {
  active: boolean;
  label: string;
};

export default function AuthProgressStatus({ active, label }: AuthProgressStatusProps) {
  const [dotCount, setDotCount] = useState(1);

  useEffect(() => {
    if (!active) {
      return;
    }

    const intervalId = window.setInterval(() => {
      setDotCount((previous) => (previous % 3) + 1);
    }, 350);

    return () => window.clearInterval(intervalId);
  }, [active]);

  const animatedText = useMemo(() => `${label}${".".repeat(dotCount)}`, [dotCount, label]);

  return (
    <Stack
      direction="row"
      spacing={1.25}
      alignItems="center"
      role="status"
      aria-live="polite"
      sx={{ pt: 0.75, minHeight: 26 }}
    >
      <CircularProgress size={18} />
      <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
        {animatedText}
      </Typography>
    </Stack>
  );
}
