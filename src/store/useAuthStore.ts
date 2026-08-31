/**
 * Iran Gate — Zustand Auth Store
 *
 * Manages authentication state, JWT persistence, and user data.
 */

import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { authService, type AuthResponse } from '@/services/authService';
import { TOKEN_KEY } from '@/services/api';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface AuthState {
  token: string | null;
  user: User | null;
  isLoading: boolean;
  isHydrated: boolean;

  /** Read token from SecureStore on app start */
  hydrate: () => Promise<void>;

  /** Login with email & password */
  login: (email: string, password: string) => Promise<AuthResponse>;

  /** Register a new account */
  register: (name: string, email: string, password: string) => Promise<AuthResponse>;

  /** Clear auth state and SecureStore */
  logout: () => Promise<void>;

  /** Set auth data after successful login/register */
  setAuth: (token: string, user: User) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  isLoading: false,
  isHydrated: false,

  hydrate: async () => {
    try {
      const token = await SecureStore.getItemAsync(TOKEN_KEY);
      const userJson = await SecureStore.getItemAsync('irangate_user');
      const user = userJson ? (JSON.parse(userJson) as User) : null;

      set({ token, user, isHydrated: true });
    } catch {
      set({ token: null, user: null, isHydrated: true });
    }
  },

  setAuth: async (token: string, user: User) => {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
    await SecureStore.setItemAsync('irangate_user', JSON.stringify(user));
    set({ token, user });
  },

  login: async (email: string, password: string) => {
    set({ isLoading: true });
    try {
      const response = await authService.login({ email, password });
      const { token, user } = response.data;
      await SecureStore.setItemAsync(TOKEN_KEY, token);
      await SecureStore.setItemAsync('irangate_user', JSON.stringify(user));
      set({ token, user, isLoading: false });
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
      const { token, user } = response.data;
      await SecureStore.setItemAsync(TOKEN_KEY, token);
      await SecureStore.setItemAsync('irangate_user', JSON.stringify(user));
      set({ token, user, isLoading: false });
      return response.data;
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  logout: async () => {
    try {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
      await SecureStore.deleteItemAsync('irangate_user');
    } catch {
      // ignore
    }
    set({ token: null, user: null });
  },
}));
