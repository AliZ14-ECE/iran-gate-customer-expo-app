/**
 * Iran Gate — Catalog Service
 */
import api from "./api";
import { Endpoints } from "./endpoints";
export interface CatalogProduct {
  id: string;
  title: string;
  description?: string | null;
  source_url?: string | null;
  image_urls?: string[];
  price?: number | null;
  weight?: number | null;
  volume?: number | null;
  is_public: boolean;
}

export interface PaginatedProducts {
  data: CatalogProduct[];
  page: number;
  limit: number;
  total_count: number;
}
export const catalogService = {
  list: (page = 1, limit = 20) =>
    api.get<PaginatedProducts>(Endpoints.catalog.list, {
      params: { page, limit },
    }),
};
