import type {
  EstablishmentType,
  ProductCategory,
  PurchaseStatus,
  Unit,
} from '../schemas/api';

export const CATEGORY_LABELS: Record<ProductCategory, string> = {
  ALIMENTOS: 'Alimentos',
  BEBIDAS: 'Bebidas',
  LIMPEZA: 'Limpeza',
  HIGIENE: 'Higiene',
  HORTIFRUTI: 'Hortifruti',
  OUTROS: 'Outros',
};

export const UNIT_LABELS: Record<Unit, string> = {
  KG: 'kg',
  G: 'g',
  L: 'L',
  ML: 'mL',
  UN: 'un',
};

export const ESTABLISHMENT_TYPE_LABELS: Record<EstablishmentType, string> = {
  SUPERMERCADO: 'Supermercado',
  FARMACIA: 'Farmácia',
  LANCHONETE: 'Lanchonete',
  RESTAURANTE: 'Restaurante',
  POSTO: 'Posto',
  OUTRO: 'Outro',
};

export const PURCHASE_STATUS_LABELS: Record<PurchaseStatus, string> = {
  MANUAL: 'Registrada manualmente',
  PENDING_OCR: 'Aguardando leitura da nota',
  CONFIRMED: 'Confirmada',
};
