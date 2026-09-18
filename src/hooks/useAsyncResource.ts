import { useCallback, useEffect, useRef, useState } from 'react';
import { ApiError, toApiError } from '../services/api/errors';

export type ResourceStatus = 'loading' | 'success' | 'empty' | 'error';

interface UseAsyncResourceOptions<T> {
  /** Decide se um resultado de sucesso deve ser tratado como estado "vazio" na UI. */
  isEmpty?: (data: T) => boolean;
  /** Se false, a busca não é disparada automaticamente (ex: aguardando um parâmetro). */
  enabled?: boolean;
}

interface UseAsyncResourceResult<T> {
  status: ResourceStatus;
  data: T | null;
  error: ApiError | null;
  refetch: () => void;
}

/**
 * Padroniza loading/sucesso/vazio/erro para telas que dependem da API,
 * evitando tela em branco enquanto a requisição está em andamento.
 */
export function useAsyncResource<T>(
  fetcher: () => Promise<T>,
  deps: React.DependencyList,
  options: UseAsyncResourceOptions<T> = {},
): UseAsyncResourceResult<T> {
  const { isEmpty, enabled = true } = options;
  const [status, setStatus] = useState<ResourceStatus>('loading');
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<ApiError | null>(null);
  const requestId = useRef(0);

  const load = useCallback(() => {
    if (!enabled) {
      return;
    }

    const currentRequestId = ++requestId.current;
    setStatus('loading');
    setError(null);

    fetcher()
      .then((result) => {
        if (requestId.current !== currentRequestId) return;
        setData(result);
        setStatus(isEmpty?.(result) ? 'empty' : 'success');
      })
      .catch((err) => {
        if (requestId.current !== currentRequestId) return;
        setError(toApiError(err));
        setStatus('error');
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, ...deps]);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [load]);

  return { status, data, error, refetch: load };
}
