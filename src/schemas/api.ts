import { z } from 'zod';

/**
 * Espelha exatamente os DTOs e enums do backend
 * (../Backend-comparaPreço/src/main/java/com/precocerto/backend/dto e /entity).
 * Não adicione campo aqui que não exista no backend — ver API-CONTRACT.md.
 */

// ---- Enums ----

export const RoleSchema = z.enum(['USER', 'ADMIN']);
export type Role = z.infer<typeof RoleSchema>;

export const ProductCategorySchema = z.enum([
  'ALIMENTOS',
  'BEBIDAS',
  'LIMPEZA',
  'HIGIENE',
  'HORTIFRUTI',
  'OUTROS',
]);
export type ProductCategory = z.infer<typeof ProductCategorySchema>;

export const UnitSchema = z.enum(['KG', 'G', 'L', 'ML', 'UN']);
export type Unit = z.infer<typeof UnitSchema>;

export const EstablishmentTypeSchema = z.enum([
  'SUPERMERCADO',
  'FARMACIA',
  'LANCHONETE',
  'RESTAURANTE',
  'POSTO',
  'OUTRO',
]);
export type EstablishmentType = z.infer<typeof EstablishmentTypeSchema>;

export const PriceSourceSchema = z.enum(['NOTA_FISCAL', 'USUARIO', 'API', 'ADMIN']);
export type PriceSource = z.infer<typeof PriceSourceSchema>;

export const PurchaseStatusSchema = z.enum(['MANUAL', 'PENDING_OCR', 'CONFIRMED']);
export type PurchaseStatus = z.infer<typeof PurchaseStatusSchema>;

// ---- Auth ----

export const RegisterRequestSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(255),
  email: z.string().email('E-mail inválido').max(255),
  password: z.string().min(8, 'Senha deve ter no mínimo 8 caracteres').max(100),
});
export type RegisterRequest = z.infer<typeof RegisterRequestSchema>;

export const LoginRequestSchema = z.object({
  email: z.string().min(1, 'E-mail é obrigatório'),
  password: z.string().min(1, 'Senha é obrigatória'),
});
export type LoginRequest = z.infer<typeof LoginRequestSchema>;

export const AuthResponseSchema = z.object({
  token: z.string(),
  expiresInMs: z.number(),
});
export type AuthResponse = z.infer<typeof AuthResponseSchema>;

export const UserResponseSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string(),
  role: RoleSchema,
  createdAt: z.string(),
});
export type UserResponse = z.infer<typeof UserResponseSchema>;

// ---- Establishments ----

export const EstablishmentRequestSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(255),
  address: z.string().max(255).nullable().optional(),
  city: z.string().min(1, 'Cidade é obrigatória').max(255),
  state: z.string().length(2, 'Estado deve ser a sigla UF com 2 letras'),
  zipCode: z.string().nullable().optional(),
  latitude: z.number().min(-90).max(90).nullable().optional(),
  longitude: z.number().min(-180).max(180).nullable().optional(),
  type: EstablishmentTypeSchema,
});
export type EstablishmentRequest = z.infer<typeof EstablishmentRequestSchema>;

export const EstablishmentResponseSchema = z.object({
  id: z.number(),
  name: z.string(),
  address: z.string().nullable(),
  city: z.string(),
  state: z.string(),
  zipCode: z.string().nullable(),
  latitude: z.number().nullable(),
  longitude: z.number().nullable(),
  type: EstablishmentTypeSchema,
  createdAt: z.string(),
});
export type EstablishmentResponse = z.infer<typeof EstablishmentResponseSchema>;

// ---- Products ----

export const ProductRequestSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(255),
  brand: z.string().max(255).nullable().optional(),
  category: ProductCategorySchema,
  unit: UnitSchema,
  description: z.string().max(1000).nullable().optional(),
});
export type ProductRequest = z.infer<typeof ProductRequestSchema>;

export const ProductResponseSchema = z.object({
  id: z.number(),
  name: z.string(),
  brand: z.string().nullable(),
  category: ProductCategorySchema,
  unit: UnitSchema,
  description: z.string().nullable(),
  createdAt: z.string(),
});
export type ProductResponse = z.infer<typeof ProductResponseSchema>;

export const ProductListSchema = z.array(ProductResponseSchema);

// ---- Prices ----

export const PriceRequestSchema = z.object({
  productId: z.number(),
  establishmentId: z.number(),
  price: z.number().positive('Preço deve ser maior que zero'),
  collectedAt: z.string().nullable().optional(),
});
export type PriceRequest = z.infer<typeof PriceRequestSchema>;

export const PriceResponseSchema = z.object({
  id: z.number(),
  productId: z.number(),
  establishmentId: z.number(),
  price: z.number(),
  collectedAt: z.string(),
  source: PriceSourceSchema,
});
export type PriceResponse = z.infer<typeof PriceResponseSchema>;

export const PriceEntrySchema = z.object({
  establishmentId: z.number(),
  establishmentName: z.string(),
  price: z.number(),
  collectedAt: z.string(),
  source: PriceSourceSchema,
});
export type PriceEntry = z.infer<typeof PriceEntrySchema>;

export const ProductPriceComparisonSchema = z.object({
  productId: z.number(),
  productName: z.string(),
  bestPrice: PriceEntrySchema.nullable(),
  prices: z.array(PriceEntrySchema),
});
export type ProductPriceComparison = z.infer<typeof ProductPriceComparisonSchema>;

// ---- Purchases ----

export const PurchaseItemRequestSchema = z.object({
  productId: z.number(),
  quantity: z.number().positive('Quantidade deve ser maior que zero'),
  unitPrice: z.number().positive('Preço unitário deve ser maior que zero'),
});
export type PurchaseItemRequest = z.infer<typeof PurchaseItemRequestSchema>;

export const PurchaseRequestSchema = z.object({
  establishmentId: z.number(),
  purchaseDate: z.string().nullable().optional(),
  items: z.array(PurchaseItemRequestSchema).min(1, 'A compra precisa ter ao menos um item'),
});
export type PurchaseRequest = z.infer<typeof PurchaseRequestSchema>;

export const PurchaseItemResponseSchema = z.object({
  id: z.number(),
  productId: z.number(),
  productName: z.string(),
  quantity: z.number(),
  unitPrice: z.number(),
  totalPrice: z.number(),
});
export type PurchaseItemResponse = z.infer<typeof PurchaseItemResponseSchema>;

export const PurchaseResponseSchema = z.object({
  id: z.number(),
  establishmentId: z.number(),
  establishmentName: z.string(),
  purchaseDate: z.string(),
  totalValue: z.number(),
  imageUrl: z.string().nullable(),
  status: PurchaseStatusSchema,
  items: z.array(PurchaseItemResponseSchema),
});
export type PurchaseResponse = z.infer<typeof PurchaseResponseSchema>;

export const PurchaseListSchema = z.array(PurchaseResponseSchema);

// ---- Errors ----

export const ErrorResponseSchema = z.object({
  timestamp: z.string().optional(),
  status: z.number(),
  error: z.string(),
  message: z.string(),
  details: z.record(z.string(), z.string()).optional(),
});
export type ErrorResponseBody = z.infer<typeof ErrorResponseSchema>;
