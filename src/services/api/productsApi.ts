import { apiClient } from './client';
import { parseResponse } from './parse';
import {
  ProductListSchema,
  ProductPriceComparisonSchema,
  ProductResponseSchema,
  type ProductPriceComparison,
  type ProductResponse,
} from '../../schemas/api';

export async function listProducts(): Promise<ProductResponse[]> {
  const { data } = await apiClient.get('/api/products');
  return parseResponse(ProductListSchema, data);
}

export async function searchProducts(name: string): Promise<ProductResponse[]> {
  const { data } = await apiClient.get('/api/products/search', { params: { name } });
  return parseResponse(ProductListSchema, data);
}

export async function getProduct(id: number): Promise<ProductResponse> {
  const { data } = await apiClient.get(`/api/products/${id}`);
  return parseResponse(ProductResponseSchema, data);
}

export async function getProductPriceComparison(id: number): Promise<ProductPriceComparison> {
  const { data } = await apiClient.get(`/api/products/${id}/prices`);
  return parseResponse(ProductPriceComparisonSchema, data);
}
