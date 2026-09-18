import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const TOKEN_KEY = 'precocerto.auth.token';
const EXPIRES_AT_KEY = 'precocerto.auth.expiresAt';

export interface StoredSession {
  token: string;
  expiresAt: number;
}

/**
 * expo-secure-store usa o Keychain/Keystore nativo e não existe na web.
 * Lá caímos para AsyncStorage (localStorage) — menos seguro, mas web é só
 * para desenvolvimento/preview; o app é feito para rodar em iOS/Android.
 */
const secureStorage = {
  async setItem(key: string, value: string): Promise<void> {
    if (Platform.OS === 'web') {
      await AsyncStorage.setItem(key, value);
    } else {
      await SecureStore.setItemAsync(key, value);
    }
  },
  async getItem(key: string): Promise<string | null> {
    if (Platform.OS === 'web') {
      return AsyncStorage.getItem(key);
    }
    return SecureStore.getItemAsync(key);
  },
  async removeItem(key: string): Promise<void> {
    if (Platform.OS === 'web') {
      await AsyncStorage.removeItem(key);
    } else {
      await SecureStore.deleteItemAsync(key);
    }
  },
};

export async function saveSession(token: string, expiresInMs: number): Promise<void> {
  const expiresAt = Date.now() + expiresInMs;
  await secureStorage.setItem(TOKEN_KEY, token);
  await secureStorage.setItem(EXPIRES_AT_KEY, String(expiresAt));
}

export async function loadSession(): Promise<StoredSession | null> {
  const [token, expiresAtRaw] = await Promise.all([
    secureStorage.getItem(TOKEN_KEY),
    secureStorage.getItem(EXPIRES_AT_KEY),
  ]);

  if (!token || !expiresAtRaw) {
    return null;
  }

  const expiresAt = Number(expiresAtRaw);
  if (!Number.isFinite(expiresAt)) {
    return null;
  }

  return { token, expiresAt };
}

export async function clearSession(): Promise<void> {
  await secureStorage.removeItem(TOKEN_KEY);
  await secureStorage.removeItem(EXPIRES_AT_KEY);
}
