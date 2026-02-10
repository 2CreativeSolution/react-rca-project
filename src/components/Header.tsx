import { AppBar, Box, Button, Container, Toolbar, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { useAuth } from "../context/useAuth";

export default function Header() {
  const { isLoggedIn, logout } = useAuth();

  return (
    <AppBar position="sticky" color="inherit" elevation={0}>
      <Toolbar disableGutters>
        <Container
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 2,
            py: 1,
          }}
        >
          <Typography
            component={RouterLink}
            to="/"
            variant="h6"
            color="text.primary"
            sx={{ textDecoration: "none", fontWeight: 700 }}
          >
            React RCA
          </Typography>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
            <Button component={RouterLink} to="/" color="inherit">
              Home
            </Button>
            <Button component={RouterLink} to="/products" color="inherit">
              Products
            </Button>
            <Button component={RouterLink} to="/cart" color="inherit">
              Cart
            </Button>
            <Button component={RouterLink} to="/dashboard" color="inherit">
              Dashboard
            </Button>
            <Button component={RouterLink} to="/settings" color="inherit">
              Settings
            </Button>

            {isLoggedIn ? (
              <Button onClick={logout} variant="contained" color="secondary">
                Logout
              </Button>
            ) : (
              <Button component={RouterLink} to="/login" variant="contained">
                Login
              </Button>
            )}
          </Box>
        </Container>
      </Toolbar>
    </AppBar>
  );
}
