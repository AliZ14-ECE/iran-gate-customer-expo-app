/**
 * Iran Gate — Auth Service
 */

import api from './api';
import { Endpoints } from './endpoints';

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
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

export const authService = {
  login: (payload: LoginPayload) =>
    api.post<AuthResponse>(Endpoints.auth.login, payload),

  register: (payload: RegisterPayload) =>
    api.post<AuthResponse>(Endpoints.auth.register, payload),

  registerPushToken: (expoPushToken: string) =>
    api.post(Endpoints.notifications.register, {
      expo_push_token: expoPushToken,
    }),
};
