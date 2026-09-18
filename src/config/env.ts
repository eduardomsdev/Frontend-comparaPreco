import { Platform } from 'react-native';

function resolveDefaultApiUrl(): string {
  // Emulador Android enxerga a máquina host em 10.0.2.2, não localhost.
  return Platform.OS === 'android' ? 'http://10.0.2.2:8080' : 'http://localhost:8080';
}

const configuredUrl = process.env.EXPO_PUBLIC_API_URL?.trim();

export const API_URL = configuredUrl && configuredUrl.length > 0 ? configuredUrl.replace(/\/+$/, '') : resolveDefaultApiUrl();

export const REQUEST_TIMEOUT_MS = 15000;
