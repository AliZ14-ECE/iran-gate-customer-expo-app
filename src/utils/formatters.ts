/**
 * Iran Gate — Formatting Utilities
 */
import type { OrderStatus } from "@/services/orderService";
/**
 * Format a number as a USD currency string.
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(amount);
}
/**
 * Format an ISO date string to a human-readable format.
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}
/**
 * Format an ISO date string with time.
 */
export function formatDateTime(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}
/**
 * Map order status enum to a user-friendly display label.
 */
const STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING_QUOTATION: "Pending Quotation",
  QUOTATION_PROVIDED: "Quote Ready",
  QUOTATION_REJECTED: "Quote Rejected",
  PAID: "Paid",
  PURCHASED: "Purchased",
  ARRIVED_FOREIGN_WH: "At Foreign Warehouse",
  DEPARTED_FOREIGN_WH: "Left Foreign Warehouse",
  ARRIVED_LOCAL_WH: "At Local Warehouse",
  OUT_FOR_DELIVERY: "Out for Delivery",
  DELIVERED: "Delivered",
};
export function getStatusLabel(status: OrderStatus): string {
  return STATUS_LABELS[status] ?? status;
}
/**
 * Get the ordered list of all statuses for timeline rendering.
 * QUOTATION_REJECTED is a branch off the main flow and is handled separately.
 */
export const ORDER_STATUSES: OrderStatus[] = [
  "PENDING_QUOTATION",
  "QUOTATION_PROVIDED",
  "PAID",
  "PURCHASED",
  "ARRIVED_FOREIGN_WH",
  "DEPARTED_FOREIGN_WH",
  "ARRIVED_LOCAL_WH",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
];
/**
 * Extract a displayable error message from an Axios error or generic error.
 */
export function getErrorMessage(error: unknown): string {
  if (error && typeof error === "object" && "response" in error) {
    const axiosError = error as {
      response?: {
        status?: number;
        data?: { message?: string; error?: string };
      };
    };

    if (axiosError.response?.status === 429) {
      return (
        axiosError.response?.data?.error ??
        axiosError.response?.data?.message ??
        "Too many requests. Please wait a moment and try again."
      );
    }

    return (
      axiosError.response?.data?.message ??
      axiosError.response?.data?.error ??
      "An unexpected error occurred"
    );
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "An unexpected error occurred";
}
