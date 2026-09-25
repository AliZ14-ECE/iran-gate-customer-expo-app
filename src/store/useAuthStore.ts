/**
 * Iran Gate — Zustand Auth Store
 *
 * Manages authentication state, access & refresh token persistence, and user data.
 */

import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { authService, type AuthResponse, type User } from '@/services/authService';
import {
  ACCESS_TOKEN_KEY,
  REFRESH_TOKEN_KEY,
  setSessionExpiredHandler,
} from '@/services/api';

export type { User };

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: User | null;
  isLoading: boolean;
  isHydrated: boolean;

  /** Read tokens and user from SecureStore on app start */
  hydrate: () => Promise<void>;

  /** Login with email & password */
  login: (email: string, password: string) => Promise<AuthResponse>;

  /** Register a new account */
  register: (name: string, email: string, password: string) => Promise<AuthResponse>;

  /** Clear auth state, revoke refresh token on backend, and remove from SecureStore */
  logout: () => Promise<void>;

  /** Set auth data after successful login/register or refresh */
  setAuth: (accessToken: string, refreshToken: string, user: User) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  refreshToken: null,
  user: null,
  isLoading: false,
  isHydrated: false,

  hydrate: async () => {
    try {
      const accessToken = await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
      const refreshToken = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
      const userJson = await SecureStore.getItemAsync('irangate_user');
      const user = userJson ? (JSON.parse(userJson) as User) : null;

      set({ accessToken, refreshToken, user, isHydrated: true });
    } catch {
      set({ accessToken: null, refreshToken: null, user: null, isHydrated: true });
    }
  },

  setAuth: async (accessToken: string, refreshToken: string, user: User) => {
    await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, accessToken);
    await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);
    await SecureStore.setItemAsync('irangate_user', JSON.stringify(user));
    set({ accessToken, refreshToken, user });
  },

  login: async (email: string, password: string) => {
    set({ isLoading: true });
    try {
      const response = await authService.login({ email, password });
      const { access_token, refresh_token, user } = response.data;
      await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, access_token);
      await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refresh_token);
      await SecureStore.setItemAsync('irangate_user', JSON.stringify(user));
      set({ accessToken: access_token, refreshToken: refresh_token, user, isLoading: false });
      return response.data;
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  register: async (name: string, email: string, password: string) => {
    set({ isLoading: true });
    try {
      const response = await authService.register({ name, email, password });
      const { access_token, refresh_token, user } = response.data;
      await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, access_token);
      await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refresh_token);
      await SecureStore.setItemAsync('irangate_user', JSON.stringify(user));
      set({ accessToken: access_token, refreshToken: refresh_token, user, isLoading: false });
      return response.data;
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  logout: async () => {
    const currentRefreshToken = useAuthStore.getState().refreshToken;
    if (currentRefreshToken) {
      try {
        await authService.logout(currentRefreshToken);
      } catch {
        // Non-critical: if server is unreachable or fails, proceed with local logout
      }
    }

    try {
      await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
      await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
      await SecureStore.deleteItemAsync('irangate_user');
    } catch {
      // ignore
    }
    set({ accessToken: null, refreshToken: null, user: null });
  },
}));

// Synchronize store when 401 interceptor detects session expiry
setSessionExpiredHandler(() => {
  useAuthStore.setState({ accessToken: null, refreshToken: null, user: null });
});
