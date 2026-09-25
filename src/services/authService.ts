/**
 * Iran Gate — Auth Service
 */

import api, { rawApi } from './api';
import { Endpoints } from './endpoints';

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  user: User;
}

export interface RefreshTokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

export const authService = {
  login: (payload: LoginPayload) =>
    api.post<AuthResponse>(Endpoints.auth.login, payload),

  register: (payload: RegisterPayload) =>
    api.post<AuthResponse>(Endpoints.auth.register, payload),

  refreshToken: (refreshToken: string) =>
    rawApi.post<RefreshTokenResponse>(Endpoints.auth.refresh, {
      refresh_token: refreshToken,
    }),

  logout: (refreshToken: string) =>
    rawApi.post(Endpoints.auth.logout, {
      refresh_token: refreshToken,
    }),

  registerPushToken: (expoPushToken: string) =>
    api.post(Endpoints.notifications.register, {
      expo_push_token: expoPushToken,
    }),
};
