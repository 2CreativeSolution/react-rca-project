import { AppBar, Box, Button, Container, Toolbar, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { ROUTES } from "../constants/routes";
import { useAuth } from "../context/useAuth";
import logo from "../assets/logo.jpg";

export default function Header() {
  const { isLoggedIn } = useAuth();

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        bgcolor: "background.paper",
        color: "text.primary",
        borderBottom: 1,
        borderColor: "divider",
      }}
    >
      <Toolbar disableGutters sx={{ minHeight: 64 }}>
        <Container
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 2,
            py: 1.25,
          }}
        >
          <Box
            component={RouterLink}
            to={ROUTES.home}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.25,
              textDecoration: "none",
              color: "text.primary",
              minWidth: 0,
            }}
          >
            <Box
              component="img"
              src={logo}
              alt="React RCA"
              sx={{
                height: 32,
                width: 32,
                objectFit: "contain",
                borderRadius: 2,
                flexShrink: 0,
              }}
            />
            <Typography
              variant="h6"
              sx={{
                fontWeight: 900,
                lineHeight: 1,
                whiteSpace: "nowrap",
              }}
            >
              RCA
            </Typography>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
            <Button
              component={RouterLink}
              to={ROUTES.home}
              color="inherit"
              sx={{
                color: "text.secondary",
                "&:hover": { bgcolor: "background.default" },
              }}
            >
              Home
            </Button>
            <Button
              component={RouterLink}
              to={ROUTES.products}
              color="inherit"
              sx={{
                color: "text.secondary",
                "&:hover": { bgcolor: "background.default" },
              }}
            >
              Products
            </Button>
            <Button
              component={RouterLink}
              to={ROUTES.cart}
              color="inherit"
              sx={{
                color: "text.secondary",
                "&:hover": { bgcolor: "background.default" },
              }}
            >
              Cart
            </Button>
            <Button
              component={RouterLink}
              to={ROUTES.catalog}
              color="inherit"
              sx={{
                color: "text.secondary",
                "&:hover": { bgcolor: "background.default" },
              }}
            >
              Catalog
            </Button>
            <Button
              component={RouterLink}
              to={ROUTES.settings}
              color="inherit"
              sx={{
                color: "text.secondary",
                "&:hover": { bgcolor: "background.default" },
              }}
            >
              Settings
            </Button>

            {isLoggedIn ? (
              <Button component={RouterLink} to={ROUTES.logout} variant="outlined" color="primary">
                Logout
              </Button>
            ) : (
              <Button component={RouterLink} to={ROUTES.login} variant="contained">
                Login
              </Button>
            )}
          </Box>
        </Container>
      </Toolbar>
    </AppBar>
  );
}
