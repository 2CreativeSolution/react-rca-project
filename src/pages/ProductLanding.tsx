import { useEffect, useState } from "react";
import { useAuth } from "../context/useAuth";
import { useNotification } from "../context/useNotification";
import { IntegrationActions } from "../services/integrationActions";
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
  const [catalogs, setCatalogs] = useState<Catalog[]>([]);
  const { isLoggedIn, token } = useAuth();
  const { notifyError } = useNotification();

  useEffect(() => {
    if (!isLoggedIn || !token) {
      return;
    }

    callIntegration<ListCatalogsResult>(token, {
      action: IntegrationActions.LIST_CATALOGS,
      defaultCatalogName: "",
    })
      .then((result) => {
        setCatalogs(result.catalogs || []);
      })
      .catch((error) => {
        setCatalogs([]);
        const message = error instanceof Error ? error.message : "Unable to load catalogs.";
        notifyError(message);
      });
  }, [isLoggedIn, notifyError, token]);

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">Catalogs</h1>

      <ul>
  {catalogs.map((catalog, index) => (
    <li key={catalog.id ?? index}>
      {catalog.name}
    </li>
  ))}
</ul>
    </div>
  );
}
