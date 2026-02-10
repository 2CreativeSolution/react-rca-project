import { createTheme } from "@mui/material/styles";
import { components } from "./components";

export const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      // Modern commerce (soft) + blue CTA.
      main: "#2563EB",
      dark: "#1D4ED8",
      light: "#60A5FA",
    },
    secondary: {
      main: "#111827",
    },
    background: {
      // Warm-ish neutral background to feel less "dashboard".
      default: "#FAFAF9",
      paper: "#FFFFFF",
    },
    divider: "#E7E5E4",
    text: {
      primary: "#111827",
      secondary: "#4B5563",
    },
  },
  shape: {
    borderRadius: 14,
  },
  typography: {
    fontFamily:
      'Manrope, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji"',
    h1: { fontWeight: 800, letterSpacing: "-0.02em" },
    h2: { fontWeight: 800, letterSpacing: "-0.02em" },
    h3: { fontWeight: 800, letterSpacing: "-0.02em" },
    h4: { fontWeight: 800, letterSpacing: "-0.01em" },
    h5: { fontWeight: 800, letterSpacing: "-0.01em" },
    h6: { fontWeight: 800 },
    button: { fontWeight: 700 },
  },
  components,
});
