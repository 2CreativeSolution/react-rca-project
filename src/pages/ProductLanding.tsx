import { useEffect, useState } from "react";
import { callIntegration } from "../services/salesforceApi";
//import { IntegrationActions } from "../services/integrationActions";
import { auth } from "../firebase";

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

type ListCatalogPayload = {
  defaultCatalogName: string;
};

export default function ProductLanding() {
  const [catalogs, setCatalogs] = useState<Catalog[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadCatalogs = async () => {
      try {
        const user = auth.currentUser;

        if (!user) {
          setError("User not authenticated");
          setLoading(false);
          return;
        }

        const token = await user.getIdToken();
        console.log("Resolved token:", token);

        const result = await callIntegration<ListCatalogsResult, ListCatalogPayload>(
          "/api/listCatalogs",
          { defaultCatalogName: "" }
        );

        setCatalogs(result.catalogs || []);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Something went wrong");
        }
      } finally {
        setLoading(false);
      }
    };

    loadCatalogs();
  }, []);

  if (loading) {
    return <div>Loading catalogs...</div>;
  }

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
