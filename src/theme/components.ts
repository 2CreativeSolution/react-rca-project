import type { Components, Theme } from "@mui/material/styles";

export const components: Components<Theme> = {
  MuiCssBaseline: {
    styleOverrides: {
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
        borderRadius: 10,
      },
    },
  },
  MuiTextField: {
    defaultProps: {
      size: "small",
      fullWidth: true,
    },
  },
};

