import type { z } from 'zod';

/** Roda um schema zod e devolve erros por campo (primeiro problema de cada campo). */
export function collectFieldErrors<T>(schema: z.ZodType<T>, values: unknown): Record<string, string> {
  const result = schema.safeParse(values);
  if (result.success) return {};

  const errors: Record<string, string> = {};
  for (const issue of result.error.issues) {
    const key = issue.path[0];
    if (typeof key === 'string' && !errors[key]) {
      errors[key] = issue.message;
    }
  }
  return errors;
}
