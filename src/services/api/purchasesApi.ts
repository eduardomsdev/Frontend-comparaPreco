import { apiClient } from './client';
import { parseResponse } from './parse';
import {
  PurchaseListSchema,
  PurchaseRequest,
  PurchaseResponseSchema,
  type PurchaseResponse,
} from '../../schemas/api';

export async function createPurchase(payload: PurchaseRequest): Promise<PurchaseResponse> {
  const { data } = await apiClient.post('/api/purchases', payload);
  return parseResponse(PurchaseResponseSchema, data);
}

export async function listMyPurchases(): Promise<PurchaseResponse[]> {
  const { data } = await apiClient.get('/api/purchases');
  return parseResponse(PurchaseListSchema, data);
}

export async function getPurchase(id: number): Promise<PurchaseResponse> {
  const { data } = await apiClient.get(`/api/purchases/${id}`);
  return parseResponse(PurchaseResponseSchema, data);
}
