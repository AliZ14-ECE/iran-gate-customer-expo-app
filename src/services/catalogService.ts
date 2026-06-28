/**
 * Iran Gate — Catalog Service
 */

import api from './api';
import { Endpoints } from './endpoints';

export interface CatalogProduct {
  id: string;
  title: string;
  description: string;
  price: number;
  image_url: string;
  category?: string;
  created_at: string;
}

export interface CatalogResponse {
  products: CatalogProduct[];
}

export const catalogService = {
  list: () => api.get<CatalogResponse>(Endpoints.catalog.list),
};
