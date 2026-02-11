import { useEffect, useState } from "react";
import { useAuth } from "../context/useAuth";
import { callIntegration } from "../services/salesforceApi";
import { IntegrationActions } from "../services/integrationActions";

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
  const [error, setError] = useState<string | null>(null);
  const { accessToken } = useAuth();

  useEffect(() => {
    if (!accessToken) return;
    callIntegration<ListCatalogsResult>(accessToken, {
      action: IntegrationActions.LIST_CATALOGS,
      defaultCatalogName: "",
    })
      .then(result => {
        // result.catalogs based on your response shape
        setCatalogs(result.catalogs || []);
      })
      .catch(err => setError(err.message));
  }, [accessToken]);

  if (error) {
    return <div className="text-red-600">Error: {error}</div>;
  }

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
