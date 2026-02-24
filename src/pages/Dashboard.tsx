import InsightsRoundedIcon from "@mui/icons-material/InsightsRounded";
import { Box, Stack, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { keyframes } from "@mui/system";

const floatPulse = keyframes`
  0%, 100% {
    transform: translateY(0);
    opacity: 0.65;
  }
  50% {
    transform: translateY(-4px);
    opacity: 1;
  }
`;

export default function Dashboard() {
  return (
    <Box
      sx={{
        minHeight: "58vh",
        display: "grid",
        placeItems: "center",
        px: 2,
      }}
    >
      <Box
        sx={{
          width: "100%",
          maxWidth: 600,
          py: { xs: 5, md: 6.5 },
          px: { xs: 3, md: 5 },
          borderRadius: 6,
          textAlign: "center",
          background: (theme) =>
            `radial-gradient(520px 190px at 50% 25%, ${alpha(theme.palette.primary.main, 0.07)} 0%, ${alpha(theme.palette.background.default, 0)} 72%), radial-gradient(620px 220px at 50% 100%, ${alpha(theme.palette.info.main, 0.05)} 0%, ${alpha(theme.palette.background.default, 0)} 76%)`,
        }}
      >
        <Stack spacing={1.5} alignItems="center">
          <InsightsRoundedIcon
            color="action"
            sx={{
              fontSize: 28,
              animation: `${floatPulse} 2.4s ease-in-out infinite`,
            }}
          />
          <Typography variant="body1" color="text.secondary">
            No dashboard data is available at this time.
          </Typography>
        </Stack>
      </Box>
    </Box>
  );
}
