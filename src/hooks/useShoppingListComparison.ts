import { useCallback, useEffect, useRef, useState } from 'react';
import { getProductPriceComparison } from '../services/api/productsApi';
import { ApiError, toApiError } from '../services/api/errors';
import type { ShoppingListItem } from '../contexts/ShoppingListContext';

export interface EstablishmentTotal {
  establishmentId: number;
  establishmentName: string;
  total: number;
  coveredCount: number;
  missingProductNames: string[];
}

type Status = 'loading' | 'success' | 'empty' | 'error';

interface Result {
  status: Status;
  totalItemCount: number;
  establishmentTotals: EstablishmentTotal[];
  error: ApiError | null;
  refetch: () => void;
}

/**
 * Não existe endpoint no backend para comparar o custo total da lista entre
 * estabelecimentos (ver API-CONTRACT.md, seção "o que ainda não existe").
 * Por isso agregamos no cliente: buscamos a comparação de preço de cada
 * produto (GET /api/products/{id}/prices, que já existe) e somamos por
 * estabelecimento, usando só dados reais retornados pela API.
 */
export function useShoppingListComparison(items: ShoppingListItem[]): Result {
  const [status, setStatus] = useState<Status>('loading');
  const [establishmentTotals, setEstablishmentTotals] = useState<EstablishmentTotal[]>([]);
  const [error, setError] = useState<ApiError | null>(null);
  const requestId = useRef(0);

  const load = useCallback(() => {
    if (items.length === 0) {
      setStatus('empty');
      setEstablishmentTotals([]);
      return;
    }

    const currentRequestId = ++requestId.current;
    setStatus('loading');
    setError(null);

    Promise.all(items.map((item) => getProductPriceComparison(item.productId)))
      .then((comparisons) => {
        if (requestId.current !== currentRequestId) return;

        const totalsByEstablishment = new Map<number, EstablishmentTotal>();
        const establishmentIds = new Set<number>();
        comparisons.forEach((comparison) => {
          comparison.prices.forEach((entry) => establishmentIds.add(entry.establishmentId));
        });

        establishmentIds.forEach((establishmentId) => {
          let establishmentName = '';
          let total = 0;
          let coveredCount = 0;
          const missingProductNames: string[] = [];

          comparisons.forEach((comparison, index) => {
            const entry = comparison.prices.find((p) => p.establishmentId === establishmentId);
            if (entry) {
              establishmentName = entry.establishmentName;
              total += entry.price * items[index].quantity;
              coveredCount += 1;
            } else {
              missingProductNames.push(items[index].name);
            }
          });

          totalsByEstablishment.set(establishmentId, {
            establishmentId,
            establishmentName,
            total,
            coveredCount,
            missingProductNames,
          });
        });

        const sorted = Array.from(totalsByEstablishment.values()).sort((a, b) => a.total - b.total);
        setEstablishmentTotals(sorted);
        setStatus(sorted.length === 0 ? 'empty' : 'success');
      })
      .catch((err) => {
        if (requestId.current !== currentRequestId) return;
        setError(toApiError(err));
        setStatus('error');
      });
  }, [items]);

  useEffect(() => {
    load();
  }, [load]);

  return { status, totalItemCount: items.length, establishmentTotals, error, refetch: load };
}
