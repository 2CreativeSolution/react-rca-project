import { Box, Button, Card, CardActions, CardContent, Typography } from "@mui/material";

type Props = {
  title: string;
  description?: string;
  price: string;
  ctaLabel?: string;
  onCta: () => void;
  height?: number;
};

export default function ProductCard({
  title,
  description,
  price,
  ctaLabel = "Add to Cart",
  onCta,
  height = 240,
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
      <CardContent sx={{ px: 3, pt: 3, pb: 2, flex: 1 }}>
        <Typography variant="h6" sx={{ mb: 0.75, lineHeight: 1.2 }}>
          {title}
        </Typography>

        {description ? (
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
        ) : null}

        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 900 }}>
            {price}
          </Typography>
        </Box>
      </CardContent>

      <CardActions
        sx={{
          mt: "auto",
          px: 3,
          pb: 3,
          pt: 0,
          justifyContent: "flex-end",
        }}
      >
        <Button onClick={onCta} variant="contained" color="primary" size="medium">
          {ctaLabel}
        </Button>
      </CardActions>
    </Card>
  );
}
