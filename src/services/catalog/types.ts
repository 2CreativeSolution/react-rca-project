export type CatalogApiEnvelope = {
  user: string;
  data: {
    success: boolean;
    result: CatalogResult;
  };
};

export type CatalogResultStatus = {
  message: string;
  errors: string[];
  code: string;
};

export type CatalogResult = {
  status: CatalogResultStatus;
  count: number;
  correlationId: string;
  catalogs: CatalogRecord[];
};

export type CatalogRecord = {
  id: string;
  name: string;
  catalogType: string;
  numberOfCategories: number;
  description?: string;
  code?: string;
  effectiveStartDate?: string;
  effectiveEndDate?: string;
};

export type CatalogItem = {
  id: string;
  name: string;
  catalogType: string;
  numberOfCategories: number;
  description?: string;
  code?: string;
  effectiveStartDate?: string;
  effectiveEndDate?: string;
};

export type CatalogPageData = {
  items: CatalogItem[];
  count: number;
};

export type CatalogSortBy = "nameAsc" | "nameDesc" | "categoriesDesc" | "categoriesAsc";
