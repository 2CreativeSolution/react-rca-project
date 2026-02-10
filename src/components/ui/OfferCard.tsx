import { Box, Button, Card, CardActions, CardContent, Typography } from "@mui/material";

type Props = {
  title: string;
  description: string;
  onAction: () => void;
  height?: number;
  ctaLabel?: string;
};

export default function OfferCard({
  title,
  description,
  onAction,
  height = 220,
  ctaLabel = "Get Offer →",
}: Props) {
  return (
    <Card
      sx={{
        height,
        width: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <CardContent
        sx={{
          px: 3,
          pt: 2.5,
          pb: 2,
          flex: 1,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2 }}>
          <Typography variant="overline" color="text.secondary" sx={{ letterSpacing: "0.08em" }}>
            Offer
          </Typography>
          <Typography variant="overline" sx={{ fontWeight: 800, color: "text.secondary" }}>
            Online
          </Typography>
        </Box>

        <Typography variant="subtitle1" sx={{ mt: 0.5, mb: 0.75, fontWeight: 900, lineHeight: 1.2 }}>
          {title}
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {description}
        </Typography>

        <Box sx={{ flex: 1 }} />
      </CardContent>

      <CardActions sx={{ mt: "auto", px: 3, pb: 3, pt: 0, justifyContent: "flex-end" }}>
        <Button onClick={onAction} size="medium">
          {ctaLabel}
        </Button>
      </CardActions>
    </Card>
  );
}
