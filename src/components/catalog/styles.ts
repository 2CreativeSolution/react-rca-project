import type { SxProps, Theme } from "@mui/material";

export const catalogGlassSurfaceSx: SxProps<Theme> = {
  border: "1px solid",
  borderColor: "divider",
  backgroundColor: "rgba(255,255,255,0.72)",
  backdropFilter: "blur(10px)",
  boxShadow: "0 20px 50px rgba(17, 24, 39, 0.08)",
};

export const catalogPremiumCardSx: SxProps<Theme> = {
  height: "100%",
  display: "flex",
  flexDirection: "column",
  overflow: "hidden",
  position: "relative",
  backgroundColor: "rgba(255,255,255,0.88)",
  transition: "transform 160ms ease, box-shadow 180ms ease, border-color 180ms ease",
  "&:hover": {
    transform: "translateY(-3px)",
    boxShadow: "0 18px 32px rgba(17, 24, 39, 0.12)",
    borderColor: "rgba(75, 85, 99, 0.35)",
  },
};
