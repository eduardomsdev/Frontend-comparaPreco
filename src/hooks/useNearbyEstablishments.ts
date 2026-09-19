import * as Location from 'expo-location';
import { useCallback, useEffect, useRef, useState } from 'react';
import { listEstablishments } from '../services/api/establishmentsApi';
import { ApiError, toApiError } from '../services/api/errors';
import { distanceKm } from '../utils/geo';
import type { EstablishmentResponse } from '../schemas/api';

export type NearbyStatus = 'loading' | 'permission-denied' | 'success' | 'empty' | 'error';

export interface NearbyEstablishment extends EstablishmentResponse {
  distanceKm: number;
}

interface Result {
  status: NearbyStatus;
  nearby: NearbyEstablishment[];
  /** Estabelecimentos existentes mas sem latitude/longitude cadastrada — não dá pra calcular distância. */
  withoutLocation: EstablishmentResponse[];
  error: ApiError | null;
  refetch: () => void;
}

/**
 * "Estabelecimentos próximos" usando só o que a API já expõe (GET /api/establishments,
 * que já inclui latitude/longitude) + localização do próprio dispositivo. Não existe
 * endpoint de "nearby" no backend — a ordenação por distância é feita aqui no cliente.
 */
export function useNearbyEstablishments(): Result {
  const [status, setStatus] = useState<NearbyStatus>('loading');
  const [nearby, setNearby] = useState<NearbyEstablishment[]>([]);
  const [withoutLocation, setWithoutLocation] = useState<EstablishmentResponse[]>([]);
  const [error, setError] = useState<ApiError | null>(null);
  const requestId = useRef(0);

  const load = useCallback(() => {
    const currentRequestId = ++requestId.current;
    setStatus('loading');
    setError(null);

    (async () => {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (requestId.current !== currentRequestId) return;

      if (permission.status !== 'granted') {
        setStatus('permission-denied');
        return;
      }

      const position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      if (requestId.current !== currentRequestId) return;

      const establishments = await listEstablishments();
      if (requestId.current !== currentRequestId) return;

      const withCoords: NearbyEstablishment[] = [];
      const noCoords: EstablishmentResponse[] = [];

      establishments.forEach((establishment) => {
        if (establishment.latitude === null || establishment.longitude === null) {
          noCoords.push(establishment);
          return;
        }
        withCoords.push({
          ...establishment,
          distanceKm: distanceKm(
            position.coords.latitude,
            position.coords.longitude,
            establishment.latitude,
            establishment.longitude,
          ),
        });
      });

      withCoords.sort((a, b) => a.distanceKm - b.distanceKm);

      setNearby(withCoords);
      setWithoutLocation(noCoords);
      setStatus(withCoords.length === 0 && noCoords.length === 0 ? 'empty' : 'success');
    })().catch((err) => {
      if (requestId.current !== currentRequestId) return;
      setError(toApiError(err));
      setStatus('error');
    });
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { status, nearby, withoutLocation, error, refetch: load };
}
