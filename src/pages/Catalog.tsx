import { Box, Stack, Typography } from "@mui/material";

export default function Catalog() {
  return (
    <Box
      sx={{
        border: 1,
        borderColor: "divider",
        borderRadius: 5,
        px: { xs: 3, md: 5 },
        py: { xs: 5, md: 7 },
        bgcolor: "background.paper",
      }}
    >
      <Stack spacing={1.5}>
        <Typography variant="overline" color="text.secondary" sx={{ letterSpacing: "0.08em" }}>
          CATALOG
        </Typography>
        <Typography variant="h4">Catalog Page</Typography>
        <Typography variant="body1" color="text.secondary">
          This page is intentionally blank for now and will host the post-login catalog experience.
        </Typography>
      </Stack>
    </Box>
  );
}
