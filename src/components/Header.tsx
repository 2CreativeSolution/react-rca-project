import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import {
  AppBar,
  Avatar,
  Badge,
  Box,
  Button,
  Container,
  IconButton,
  ListItemIcon,
  Menu,
  MenuItem,
  Toolbar,
  Typography,
} from "@mui/material";
import { useEffect, useMemo, useState, type MouseEvent } from "react";
import { Link as RouterLink, useLocation } from "react-router-dom";
import { APP_EVENTS } from "../constants/appEvents";
import { ROUTES } from "../constants/routes";
import { useAuth } from "../context/useAuth";
import { getQuotesWithQuoteLines } from "../services/salesforceApi";
import { getCartItemCount } from "../utils/cart";
import logo from "../assets/logo.jpg";

export default function Header() {
  const { currentUser, decisionSession, isLoggedIn, profilePhotoUrl } = useAuth();
  const location = useLocation();
  const [cartItemCount, setCartItemCount] = useState(0);
  const [cartRefreshTick, setCartRefreshTick] = useState(0);
  const [accountMenuAnchor, setAccountMenuAnchor] = useState<null | HTMLElement>(null);
  const quoteId = decisionSession.quoteId?.trim() ?? "";
  const visibleCartItemCount = isLoggedIn && quoteId ? cartItemCount : 0;
  const isAccountMenuOpen = Boolean(accountMenuAnchor);
  const accountInitials = useMemo(() => {
    const fullName = currentUser?.displayName?.trim();
    if (fullName) {
      const parts = fullName.split(/\s+/).filter(Boolean);
      const initials = `${parts[0]?.[0] ?? ""}${parts[1]?.[0] ?? ""}`;
      return initials.toUpperCase();
    }

    const email = currentUser?.email?.trim();
    return email?.[0]?.toUpperCase() ?? "U";
  }, [currentUser?.displayName, currentUser?.email]);

  useEffect(() => {
    const handleCartUpdated = () => {
      setCartRefreshTick((previous) => previous + 1);
    };

    window.addEventListener(APP_EVENTS.cartUpdated, handleCartUpdated);
    return () => {
      window.removeEventListener(APP_EVENTS.cartUpdated, handleCartUpdated);
    };
  }, []);

  useEffect(() => {
    if (!isLoggedIn || !quoteId) {
      return;
    }

    let isMounted = true;

    const loadCartItemCount = async () => {
      try {
        const quote = await getQuotesWithQuoteLines({ quoteId });
        if (!isMounted) {
          return;
        }
        const summaryCount = getCartItemCount(quote.lineItems);
        setCartItemCount(summaryCount);
      } catch {
        if (isMounted) {
          setCartItemCount(0);
        }
      }
    };

    void loadCartItemCount();

    return () => {
      isMounted = false;
    };
  }, [cartRefreshTick, isLoggedIn, quoteId, location.pathname]);

  const openAccountMenu = (event: MouseEvent<HTMLElement>) => {
    setAccountMenuAnchor(event.currentTarget);
  };

  const closeAccountMenu = () => {
    setAccountMenuAnchor(null);
  };

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
              to={ROUTES.catalog}
              color="inherit"
              sx={{
                color: "text.secondary",
                "&:hover": { bgcolor: "background.default" },
              }}
            >
              Catalog
            </Button>
            <IconButton
              component={RouterLink}
              to={ROUTES.cart}
              color="inherit"
              aria-label="Cart"
              sx={{
                color: "text.secondary",
                "&:hover": { bgcolor: "background.default" },
              }}
            >
              <Badge badgeContent={visibleCartItemCount} color="error" max={99} invisible={visibleCartItemCount <= 0}>
                <ShoppingCartOutlinedIcon fontSize="small" />
              </Badge>
            </IconButton>

            {isLoggedIn ? (
              <>
                <IconButton
                  color="inherit"
                  aria-label="Account menu"
                  aria-controls={isAccountMenuOpen ? "account-menu" : undefined}
                  aria-haspopup="true"
                  aria-expanded={isAccountMenuOpen ? "true" : undefined}
                  onClick={openAccountMenu}
                  sx={{
                    color: "text.secondary",
                    "&:hover": { bgcolor: "background.default" },
                  }}
                >
                  <Avatar alt={currentUser?.displayName ?? currentUser?.email ?? "User"} src={profilePhotoUrl ?? undefined}>
                    {accountInitials}
                  </Avatar>
                </IconButton>
                <Menu
                  id="account-menu"
                  anchorEl={accountMenuAnchor}
                  open={isAccountMenuOpen}
                  onClose={closeAccountMenu}
                  transformOrigin={{ horizontal: "right", vertical: "top" }}
                  anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
                >
                  <MenuItem component={RouterLink} to={ROUTES.settings} onClick={closeAccountMenu}>
                    <ListItemIcon>
                      <SettingsOutlinedIcon fontSize="small" />
                    </ListItemIcon>
                    Settings
                  </MenuItem>
                  <MenuItem component={RouterLink} to={ROUTES.logout} onClick={closeAccountMenu}>
                    <ListItemIcon>
                      <LogoutOutlinedIcon fontSize="small" />
                    </ListItemIcon>
                    Logout
                  </MenuItem>
                </Menu>
              </>
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
