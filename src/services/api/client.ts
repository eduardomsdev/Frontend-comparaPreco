import axios from 'axios';
import { API_URL, REQUEST_TIMEOUT_MS } from '../../config/env';
import { ApiError, toApiError } from './errors';

let authToken: string | null = null;
let onUnauthorized: (() => void) | null = null;

/** Chamado pelo AuthContext quando a sessão muda (login/logout/restauração). */
export function setAuthToken(token: string | null): void {
  authToken = token;
}

/** Chamado pelo AuthContext para reagir a um 401 vindo de qualquer chamada (token expirado/inválido). */
export function setUnauthorizedHandler(handler: (() => void) | null): void {
  onUnauthorized = handler;
}

export const apiClient = axios.create({
  baseURL: API_URL,
  timeout: REQUEST_TIMEOUT_MS,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  if (authToken) {
    config.headers.set('Authorization', `Bearer ${authToken}`);
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const apiError = toApiError(error);

    if (apiError.isSessionExpired) {
      onUnauthorized?.();
    }

    return Promise.reject(apiError);
  },
);

export type { ApiError };
