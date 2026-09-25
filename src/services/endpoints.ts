/**
 * Iran Gate — Centralized Endpoint Registry
 *
 * All backend API endpoints are defined here in a single file.
 * When the backend changes, update ONLY this file.
 *
 * Usage:
 *   import { Endpoints } from '@/services/endpoints';
 *   api.post(Endpoints.auth.login, body);
 *   api.get(Endpoints.orders.byId('abc-123'));
 */

export const Endpoints = {
  // ─── Auth & Common ──────────────────────────────────────
  auth: {
    /** POST — body: { email, password } */
    login: '/auth/login',
    /** POST — body: { name, email, password } */
    register: '/auth/register',
    /** POST — body: { refresh_token } */
    refresh: '/auth/refresh',
    /** POST — body: { refresh_token } */
    logout: '/auth/logout',
  },

  notifications: {
    /** POST — body: { expo_push_token } */
    register: '/notifications/register',
  },

  /** POST — multipart/form-data for image uploads */
  upload: '/upload',

  // ─── Customer Orders ────────────────────────────────────
  orders: {
    /** GET (list) / POST (create) */
    base: '/orders',
    /** GET — single order details */
    byId: (orderId: string) => `/orders/${orderId}` as const,
  },

  // ─── Catalog ────────────────────────────────────────────
  catalog: {
    /** GET — public product listing */
    list: '/catalog',
  },
} as const;
