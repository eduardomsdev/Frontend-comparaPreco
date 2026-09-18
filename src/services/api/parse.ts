import type { z } from 'zod';
import { ApiError } from './errors';

/**
 * Valida o corpo da resposta contra o schema esperado antes de repassar para a UI.
 * Não confiamos cegamente no formato vindo do backend (ver seção de segurança).
 */
export function parseResponse<T extends z.ZodTypeAny>(schema: T, data: unknown): z.infer<T> {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw new ApiError('UNKNOWN_ERROR', 502, 'A resposta do servidor veio em um formato inesperado.');
  }
  return result.data;
}
