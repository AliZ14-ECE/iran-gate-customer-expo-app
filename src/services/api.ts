/**
 * Iran Gate — Axios Instances & Interceptors
 *
 * Configured with:
 *  - Base URL from environment
 *  - Request interceptor to attach access token from SecureStore
 *  - Response interceptor for automatic 401 token refresh with request queueing
 *  - rawApi instance for unintercepted requests (auth refresh, logout)
 */

import {
  create as createAxios,
  AxiosError,
  type InternalAxiosRequestConfig,
} from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Endpoints } from './endpoints';

export const ACCESS_TOKEN_KEY = 'irangate_access_token';
export const REFRESH_TOKEN_KEY = 'irangate_refresh_token';

type SessionExpiredHandler = () => void;
let onSessionExpired: SessionExpiredHandler | null = null;

export const setSessionExpiredHandler = (handler: SessionExpiredHandler | null) => {
  onSessionExpired = handler;
};

/** Raw axios instance without interceptors (used for refresh & logout) */
export const rawApi = createAxios({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/** Main axios instance with auth interceptors */
const api = createAxios({
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
      const accessToken = await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
    } catch {
      // SecureStore not available (e.g. web) — continue without token
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// ── 401 Refresh & Queue Management ────────────────────────
interface QueuedRequest {
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}

let isRefreshing = false;
let failedQueue: QueuedRequest[] = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else if (token) {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

const clearStoredAuth = async () => {
  try {
    await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
    await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
    await SecureStore.deleteItemAsync('irangate_user');
  } catch {
    // ignore
  }
};

// ── Response Interceptor ──────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;

    if (!originalRequest || error.response?.status !== 401) {
      return Promise.reject(error);
    }

    const url = originalRequest.url ?? '';
    const isAuthRoute =
      url.includes(Endpoints.auth.login) ||
      url.includes(Endpoints.auth.register) ||
      url.includes(Endpoints.auth.refresh);

    // If 401 came from an auth endpoint or request already retried, do not attempt refresh
    if (isAuthRoute || originalRequest._retry) {
      if (originalRequest._retry || url.includes(Endpoints.auth.refresh)) {
        await clearStoredAuth();
        onSessionExpired?.();
      }
      return Promise.reject(error);
    }

    // If a refresh is already in progress, enqueue this request
    if (isRefreshing) {
      return new Promise<string>((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        })
        .catch((queueError) => Promise.reject(queueError));
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const refreshToken = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await rawApi.post<{
        access_token: string;
        refresh_token: string;
        token_type: string;
        expires_in: number;
      }>(Endpoints.auth.refresh, {
        refresh_token: refreshToken,
      });

      const { access_token, refresh_token: newRefreshToken } = response.data;

      await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, access_token);
      if (newRefreshToken) {
        await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, newRefreshToken);
      }

      processQueue(null, access_token);

      originalRequest.headers.Authorization = `Bearer ${access_token}`;
      return api(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);
      await clearStoredAuth();
      onSessionExpired?.();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);

export default api;
