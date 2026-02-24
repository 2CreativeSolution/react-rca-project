import { Box, Container, Link, Stack, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { PRODUCT_COPY } from "../constants/productContent";
import { ROUTES } from "../constants/routes";

export default function Footer() {
  const settingsCopy = PRODUCT_COPY.settings;

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
            © 2026 RCA
          </Typography>

          <Stack direction="row" spacing={2} useFlexGap flexWrap="wrap">
            <Link component={RouterLink} to={ROUTES.legal} underline="hover" color="text.secondary">
              {settingsCopy.legalLinkLabel}
            </Link>
            <Link component={RouterLink} to={ROUTES.contact} underline="hover" color="text.secondary">
              {settingsCopy.contactLinkLabel}
            </Link>
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
}
