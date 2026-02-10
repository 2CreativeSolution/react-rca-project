import { createTheme } from "@mui/material/styles";
import { components } from "./components";

export const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#155EEF",
    },
    secondary: {
      main: "#111827",
    },
    background: {
      default: "#F8FAFC",
      paper: "#FFFFFF",
    },
  },
  shape: {
    borderRadius: 10,
  },
  typography: {
    fontFamily:
      'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji"',
  },
  components,
});

