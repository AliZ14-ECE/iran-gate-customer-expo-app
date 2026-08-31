/**
 * Iran Gate — Order Service
 */
import { Platform } from "react-native";
import api from "./api";
import { Endpoints } from "./endpoints";
// ── Types ─────────────────────────────────────────────────
export type OrderStatus =
  | "PENDING_QUOTATION"
  | "QUOTATION_PROVIDED"
  | "QUOTATION_REJECTED"
  | "PAID"
  | "PURCHASED"
  | "ARRIVED_FOREIGN_WH"
  | "DEPARTED_FOREIGN_WH"
  | "ARRIVED_LOCAL_WH"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED";
export interface CreateOrderPayload {
  source_url: string;
  title: string;
  description?: string;
  image_urls?: string[];
  declared_price?: number;
  declared_weight?: number;
  declared_volume?: number;
  declared_shipping_fee?: number;
}
export interface Order {
  id: string;
  customer_id: string;
  source_url: string;
  title: string;
  description?: string | null;
  image_urls?: string[];
  declared_price?: number | null;
  verified_price?: number | null;
  declared_shipping_fee?: number | null;
  verified_shipping_fee?: number | null;
  declared_weight?: number | null;
  verified_weight?: number | null;
  declared_volume?: number | null;
  verified_volume?: number | null;
  supplier_tracking_number?: string | null;
  transit_shipment_id?: string | null;
  current_warehouse_id?: string | null;
  status: OrderStatus;
  created_at: string;
  updated_at: string;
}
export interface OrdersListResponse {
  data: Order[];
  total_count: number;
  page: number;
  limit: number;
}
export interface UploadResponse {
  url: string;
  key: string;
}
// ── Service ───────────────────────────────────────────────
export const orderService = {
  create: (payload: CreateOrderPayload) =>
    api.post<Order>(Endpoints.orders.base, payload),
  list: (page = 1, limit = 20) =>
    api.get<OrdersListResponse>(Endpoints.orders.base, {
      params: { page, limit },
    }),
  getById: (orderId: string) => api.get<Order>(Endpoints.orders.byId(orderId)),
  /**
   * Upload an image file via multipart/form-data.
   * Accepts a local file URI from ImagePicker.
   */
  uploadImage: async (fileUri: string): Promise<string> => {
    const formData = new FormData();
    const filename = fileUri.split("/").pop() ?? "photo.jpg";
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : "image/jpeg";
    // React Native requires this cast for FormData file objects
    formData.append("file", {
      uri: Platform.OS === "ios" ? fileUri.replace("file://", "") : fileUri,
      name: filename,
      type,
    } as unknown as Blob);
    const response = await api.post<UploadResponse>(
      Endpoints.upload,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      },
    );
    return response.data.url;
  },
};
