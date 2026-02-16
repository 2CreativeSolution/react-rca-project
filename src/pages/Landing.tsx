import {
  Alert,
  Box,
  Button,
  Stack,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import OfferCard from "../components/ui/OfferCard";
import ProductCard from "../components/ui/ProductCard";

type Offer = {
  title: string;
  desc: string;
};

type Service = {
  name: string;
  desc: string;
  price: string;
};

type Plan = {
  name: string;
  desc: string;
  price: string;
};

// TODO: Replace these with API-driven values (Salesforce).
const OFFERS: Offer[] = [
  { title: "Internet + TV Combo", desc: "Save $120 on annual subscription" },
  { title: "Unlimited Calling", desc: "First 3 months free" },
  { title: "Family Plans", desc: "Up to 4 lines with shared data" },
];

const SERVICES: Service[] = [
  { name: "Mobile Plans", desc: "Unlimited calls & data", price: "$45 / month" },
  { name: "Home Internet", desc: "Up to 1 Gbps speed", price: "$60 / month" },
  { name: "TV & Streaming", desc: "150+ channels included", price: "$40 / month" },
];

const BEST_SELLERS: Plan[] = [
  { name: "All-In-One Max", desc: "Mobile + Internet + TV", price: "$99 / month" },
  { name: "Unlimited Plus", desc: "Best for families & streaming", price: "$79 / month" },
];

export default function Landing() {
  const navigate = useNavigate();
  const [catalogTab, setCatalogTab] = useState<0 | 1>(0);

  const sectionPx = { xs: 3, md: 6 } as const;
  const cardColMax = 360;

  const handleAddToCart = () => {
    // until auth is ready, always redirect to login
    navigate("/login");
  };

  return (
    <Stack spacing={4}>
      {/* TOP PROMO BANNER (in-container, calmer UX than full-bleed) */}
      <Alert
        severity="info"
        action={
          <Typography
            variant="body2"
            sx={{
              fontWeight: 700,
              whiteSpace: "nowrap",
              mt: 0,
              lineHeight: 1.4,
              color: "text.secondary",
            }}
          >
            T&amp;Cs apply.
          </Typography>
        }
        sx={{
          borderRadius: 4,
          border: 1,
          borderColor: "divider",
          bgcolor: "background.paper",
          px: 2.5,
          py: 0.75,
          alignItems: "center",
          "& .MuiAlert-message": { py: 0 },
          "& .MuiAlert-icon": { py: 0.25, mr: 1 },
          "& .MuiAlert-action": { alignItems: "center", py: 0, mr: 0, pr: 0 },
        }}
      >
        <Typography variant="body2">
          <Box component="span" sx={{ fontWeight: 800 }}>
            Limited time offer:
          </Box>{" "}
          Get up to $150 off on new connections.
        </Typography>
      </Alert>

      {/* HERO SECTION */}
      <Box
        sx={{
          borderRadius: 6,
          px: sectionPx,
          py: { xs: 4, md: 6 },
          border: 1,
          borderColor: "divider",
          bgcolor: "background.paper",
          background:
            "radial-gradient(1200px 400px at 10% 0%, rgba(37,99,235,0.18) 0%, rgba(250,250,249,0) 60%), radial-gradient(900px 300px at 100% 30%, rgba(249,115,22,0.10) 0%, rgba(250,250,249,0) 55%)",
        }}
      >
        <Stack spacing={2} sx={{ maxWidth: 820 }}>
          <Typography variant="h3" sx={{ lineHeight: 1.05 }}>
            One connection for everything you need
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 500 }}>
            High-speed internet, unlimited calling, and premium TV, all in one simple plan.
          </Typography>

          <Stack direction="row" spacing={2} useFlexGap flexWrap="wrap" sx={{ pt: 1 }}>
            <Button variant="contained" onClick={() => navigate("/dashboard")}>
              Dashboard
            </Button>
            <Button variant="outlined" onClick={() => navigate("/products")}>
              Browse products
            </Button>
          </Stack>
        </Stack>
      </Box>

      {/* DISCOUNTS SECTION */}
      <Box component="section" sx={{ px: sectionPx }}>
        <Typography variant="h5" sx={{ mb: 2 }}>
          Exclusive Online Offers
        </Typography>

        <Box
          sx={{
            display: "grid",
            gap: 2,
            justifyContent: "flex-start",
            gridTemplateColumns: {
              xs: "1fr",
              sm: `repeat(2, minmax(0px, ${cardColMax}px))`,
              md: `repeat(3, minmax(0px, ${cardColMax}px))`,
            },
          }}
        >
          {OFFERS.map((offer) => (
            <OfferCard
              key={offer.title}
              title={offer.title}
              description={offer.desc}
              onAction={handleAddToCart}
            />
          ))}
        </Box>
      </Box>

      {/* SERVICES + PLANS (Tabbed) */}
      <Box component="section" sx={{ px: sectionPx }}>
        <Typography variant="h5" sx={{ mb: 1 }}>
          Explore
        </Typography>

        <Tabs
          value={catalogTab}
          onChange={(_, next) => setCatalogTab(next)}
          sx={{ mb: 2 }}
        >
          <Tab label="Services" value={0} />
          <Tab label="Best Selling Plans" value={1} />
        </Tabs>

        {catalogTab === 0 ? (
          <Box
            sx={{
              display: "grid",
              gap: 2,
              justifyContent: "flex-start",
              gridTemplateColumns: {
                xs: "1fr",
                sm: `repeat(2, minmax(0px, ${cardColMax}px))`,
                md: `repeat(3, minmax(0px, ${cardColMax}px))`,
              },
            }}
          >
            {SERVICES.map((service) => (
              <ProductCard
                key={service.name}
                title={service.name}
                description={service.desc}
                price={service.price}
                onCta={handleAddToCart}
                height={240}
              />
            ))}
          </Box>
        ) : (
          <Box
            sx={{
              display: "grid",
              gap: 2,
              justifyContent: "flex-start",
              gridTemplateColumns: {
                xs: "1fr",
                sm: `repeat(2, minmax(0px, ${cardColMax}px))`,
                md: `repeat(3, minmax(0px, ${cardColMax}px))`,
              },
            }}
          >
            {BEST_SELLERS.map((plan) => (
              <ProductCard
                key={plan.name}
                title={plan.name}
                description={plan.desc}
                price={plan.price}
                onCta={handleAddToCart}
                height={240}
              />
            ))}
          </Box>
        )}
      </Box>
    </Stack>
  );
}
