/**
 * Iran Gate — Order Service
 */

import api from './api';
import { Endpoints } from './endpoints';
import { Platform } from 'react-native';

// ── Types ─────────────────────────────────────────────────

export type OrderStatus =
  | 'PENDING_QUOTATION'
  | 'QUOTATION_PROVIDED'
  | 'PAID'
  | 'PURCHASED'
  | 'ARRIVED_FOREIGN_WH'
  | 'ARRIVED_LOCAL_WH'
  | 'DELIVERED';

export interface CreateOrderPayload {
  source_url: string;
  title: string;
  description: string;
  image_urls: string[];
  declared_price: number;
}

export interface Order {
  id: string;
  user_id: string;
  source_url: string;
  title: string;
  description: string;
  image_urls: string[];
  declared_price: number;
  verified_price?: number;
  shipping_fee?: number;
  weight?: number;
  status: OrderStatus;
  created_at: string;
  updated_at: string;
}

export interface OrdersListResponse {
  orders: Order[];
  total: number;
  page: number;
  per_page: number;
}

export interface UploadResponse {
  url: string;
}

// ── Service ───────────────────────────────────────────────

export const orderService = {
  create: (payload: CreateOrderPayload) =>
    api.post<Order>(Endpoints.orders.base, payload),

  list: () =>
    api.get<OrdersListResponse>(Endpoints.orders.base),

  getById: (orderId: string) =>
    api.get<Order>(Endpoints.orders.byId(orderId)),

  /**
   * Upload an image file via multipart/form-data.
   * Accepts a local file URI from ImagePicker.
   */
  uploadImage: async (fileUri: string): Promise<string> => {
    const formData = new FormData();

    const filename = fileUri.split('/').pop() ?? 'photo.jpg';
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : 'image/jpeg';

    // React Native requires this cast for FormData file objects
    formData.append('file', {
      uri: Platform.OS === 'ios' ? fileUri.replace('file://', '') : fileUri,
      name: filename,
      type,
    } as unknown as Blob);

    const response = await api.post<UploadResponse>(Endpoints.upload, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    return response.data.url;
  },
};
