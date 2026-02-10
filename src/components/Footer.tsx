import { Box, Container, Link, Stack, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";

export default function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        borderTop: 1,
        borderColor: "divider",
        bgcolor: "background.paper",
      }}
    >
      <Container sx={{ py: 3 }}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          alignItems={{ xs: "flex-start", sm: "center" }}
          justifyContent="space-between"
        >
          <Typography variant="body2" color="text.secondary">
            © 2026 React RCA
          </Typography>

          <Stack direction="row" spacing={2} useFlexGap flexWrap="wrap">
            <Link component={RouterLink} to="/terms" underline="hover" color="text.secondary">
              Terms
            </Link>
            <Link component={RouterLink} to="/privacy" underline="hover" color="text.secondary">
              Privacy
            </Link>
            <Link component={RouterLink} to="/contact" underline="hover" color="text.secondary">
              Contact
            </Link>
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
}
