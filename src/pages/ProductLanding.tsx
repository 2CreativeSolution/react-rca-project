import { Box, CircularProgress, List, ListItem, ListItemText, Paper, Stack, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { INTEGRATION_ROUTES } from "../constants/integrationRoutes";
import { PRODUCT_COPY } from "../constants/productContent";
import { useNotification } from "../context/useNotification";
import { callIntegration } from "../services/salesforceApi";

type Catalog = {
  id?: string;
  name: string;
};

type ListCatalogsResult = {
  status: {
    count: number;
    correlationId: string;
  };
  catalogs: Catalog[];
};

export default function ProductLanding() {
  const productLandingCopy = PRODUCT_COPY.landing;
  const [catalogs, setCatalogs] = useState<Catalog[]>([]);
  const [loading, setLoading] = useState(true);
  const { notifyError } = useNotification();

  useEffect(() => {
    callIntegration<ListCatalogsResult, { defaultCatalogName: string }>(INTEGRATION_ROUTES.listCatalogs, {
      defaultCatalogName: "",
    })
      .then((result) => {
        setCatalogs(result.catalogs || []);
      })
      .catch((error) => {
        setCatalogs([]);
        const message = error instanceof Error ? error.message : productLandingCopy.fallbackErrorMessage;
        notifyError(message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [notifyError, productLandingCopy.fallbackErrorMessage]);

  if (loading) {
    return (
      <Stack alignItems="center" justifyContent="center" spacing={1.5} sx={{ py: 10 }}>
        <CircularProgress size={28} />
        <Typography color="text.secondary" variant="body2">
          {productLandingCopy.loadingMessage}
        </Typography>
      </Stack>
    );
  }

  return (
    <Stack spacing={2.5} sx={{ py: 1 }}>
      <Typography variant="h4">{productLandingCopy.title}</Typography>
      <Paper variant="outlined" sx={{ borderRadius: 2 }}>
        {catalogs.length === 0 ? (
          <Box sx={{ p: 2.5 }}>
            <Typography color="text.secondary" variant="body1">
              {productLandingCopy.emptyMessage}
            </Typography>
          </Box>
        ) : (
          <List disablePadding>
            {catalogs.map((catalog, index) => (
              <ListItem divider key={catalog.id ?? index}>
                <ListItemText primary={catalog.name} />
              </ListItem>
            ))}
          </List>
        )}
      </Paper>
    </Stack>
  );
}
