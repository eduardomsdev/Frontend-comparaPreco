import { apiClient } from './client';
import { parseResponse } from './parse';
import {
  AuthResponseSchema,
  LoginRequest,
  RegisterRequest,
  UserResponseSchema,
  type AuthResponse,
  type UserResponse,
} from '../../schemas/api';

export async function register(payload: RegisterRequest): Promise<UserResponse> {
  const { data } = await apiClient.post('/api/auth/register', payload);
  return parseResponse(UserResponseSchema, data);
}

export async function login(payload: LoginRequest): Promise<AuthResponse> {
  const { data } = await apiClient.post('/api/auth/login', payload);
  return parseResponse(AuthResponseSchema, data);
}

export async function getCurrentUser(): Promise<UserResponse> {
  const { data } = await apiClient.get('/api/users/me');
  return parseResponse(UserResponseSchema, data);
}
