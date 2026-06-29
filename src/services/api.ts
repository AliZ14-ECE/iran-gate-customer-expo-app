/**
 * Iran Gate — Axios Instance
 *
 * Configured with:
 *  - Base URL from environment
 *  - Request interceptor to attach JWT from SecureStore
 *  - Response interceptor for 401 handling
 */

import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'irangate_jwt';

const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ── Request Interceptor ───────────────────────────────────
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await SecureStore.getItemAsync(TOKEN_KEY);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch {
      // SecureStore not available (e.g. web) — continue without token
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// ── Response Interceptor ──────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid — clear it
      try {
        await SecureStore.deleteItemAsync(TOKEN_KEY);
      } catch {
        // ignore
      }
      // The auth store's hydrate/check will redirect to login
    }
    return Promise.reject(error);
  },
);

export { TOKEN_KEY };
export default api;
