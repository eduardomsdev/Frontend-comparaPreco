import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { ProductResponse, Unit } from '../schemas/api';

const STORAGE_KEY = 'precocerto.shoppingList.v1';

export interface ShoppingListItem {
  productId: number;
  name: string;
  brand: string | null;
  unit: Unit;
  quantity: number;
}

interface ShoppingListContextValue {
  items: ShoppingListItem[];
  isReady: boolean;
  addProduct: (product: ProductResponse, quantity?: number) => void;
  removeItem: (productId: number) => void;
  setQuantity: (productId: number, quantity: number) => void;
  clear: () => void;
}

const ShoppingListContext = createContext<ShoppingListContextValue | undefined>(undefined);

function isValidStoredList(value: unknown): value is ShoppingListItem[] {
  return (
    Array.isArray(value) &&
    value.every(
      (item) =>
        item &&
        typeof item.productId === 'number' &&
        typeof item.name === 'string' &&
        typeof item.quantity === 'number',
    )
  );
}

export function ShoppingListProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ShoppingListItem[]>([]);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed: unknown = JSON.parse(raw);
          if (isValidStoredList(parsed)) {
            setItems(parsed);
          }
        }
      } catch {
        // Dado local corrompido: segue com lista vazia em vez de travar o app.
      } finally {
        setIsReady(true);
      }
    })();
  }, []);

  useEffect(() => {
    if (!isReady) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(items)).catch(() => undefined);
  }, [items, isReady]);

  const value = useMemo<ShoppingListContextValue>(
    () => ({
      items,
      isReady,
      addProduct: (product, quantity = 1) => {
        setItems((prev) => {
          const existing = prev.find((item) => item.productId === product.id);
          if (existing) {
            return prev.map((item) =>
              item.productId === product.id ? { ...item, quantity: item.quantity + quantity } : item,
            );
          }
          return [
            ...prev,
            {
              productId: product.id,
              name: product.name,
              brand: product.brand,
              unit: product.unit,
              quantity,
            },
          ];
        });
      },
      removeItem: (productId) => {
        setItems((prev) => prev.filter((item) => item.productId !== productId));
      },
      setQuantity: (productId, quantity) => {
        setItems((prev) => {
          if (quantity <= 0) {
            return prev.filter((item) => item.productId !== productId);
          }
          return prev.map((item) => (item.productId === productId ? { ...item, quantity } : item));
        });
      },
      clear: () => setItems([]),
    }),
    [items, isReady],
  );

  return <ShoppingListContext.Provider value={value}>{children}</ShoppingListContext.Provider>;
}

export function useShoppingList(): ShoppingListContextValue {
  const context = useContext(ShoppingListContext);
  if (!context) {
    throw new Error('useShoppingList deve ser usado dentro de um ShoppingListProvider');
  }
  return context;
}
