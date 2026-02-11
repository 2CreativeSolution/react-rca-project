import type { Components, Theme } from "@mui/material/styles";

export const components: Components<Theme> = {
  MuiCssBaseline: {
    styleOverrides: {
      html: {
        WebkitFontSmoothing: "antialiased",
        MozOsxFontSmoothing: "grayscale",
      },
      body: {
        margin: 0,
      },
    },
  },
  MuiContainer: {
    defaultProps: {
      maxWidth: "lg",
    },
  },
  MuiButton: {
    defaultProps: {
      disableElevation: true,
    },
    styleOverrides: {
      root: {
        textTransform: "none",
        borderRadius: 999,
        paddingLeft: 16,
        paddingRight: 16,
      },
    },
  },
  MuiTextField: {
    defaultProps: {
      size: "small",
      fullWidth: true,
    },
  },
  MuiCard: {
    styleOverrides: {
      root: ({ theme }) => ({
        borderRadius: (typeof theme.shape.borderRadius === "number"
          ? theme.shape.borderRadius
          : Number.parseInt(String(theme.shape.borderRadius), 10) || 0) + 6,
        border: `1px solid ${theme.palette.divider}`,
        boxShadow: "0 1px 1px rgba(0,0,0,0.03), 0 10px 30px rgba(0,0,0,0.06)",
      }),
    },
  },
  MuiCardContent: {
    styleOverrides: {
      root: {
        paddingBottom: 16,
      },
    },
  },
  MuiCardActions: {
    styleOverrides: {
      root: {
        paddingTop: 0,
      },
    },
  },
};
