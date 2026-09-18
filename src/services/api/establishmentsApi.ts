import { apiClient } from './client';
import { parseResponse } from './parse';
import { EstablishmentResponseSchema, type EstablishmentResponse } from '../../schemas/api';
import { z } from 'zod';

const EstablishmentListSchema = z.array(EstablishmentResponseSchema);

export async function listEstablishments(): Promise<EstablishmentResponse[]> {
  const { data } = await apiClient.get('/api/establishments');
  return parseResponse(EstablishmentListSchema, data);
}

export async function getEstablishment(id: number): Promise<EstablishmentResponse> {
  const { data } = await apiClient.get(`/api/establishments/${id}`);
  return parseResponse(EstablishmentResponseSchema, data);
}
