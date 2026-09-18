import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, TextInput, View } from 'react-native';
import { ErrorState, LoadingState } from '../../components/ui';
import { EmptyState } from '../../components/ui/EmptyState';
import { ProductListItem } from '../../components/products/ProductListItem';
import { listProducts, searchProducts } from '../../services/api/productsApi';
import { ApiError, friendlyMessage, toApiError } from '../../services/api/errors';
import { colors, radius, spacing, typography } from '../../theme';
import type { ProductResponse } from '../../schemas/api';
import type { HomeStackParamList, ProductsStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<ProductsStackParamList | HomeStackParamList, 'ProductSearch'>;

const DEBOUNCE_MS = 400;

export function ProductSearchScreen({ navigation, route }: Props) {
  const [query, setQuery] = useState(route.params?.initialQuery ?? '');
  const [status, setStatus] = useState<'loading' | 'success' | 'empty' | 'error'>('loading');
  const [products, setProducts] = useState<ProductResponse[]>([]);
  const [error, setError] = useState<ApiError | null>(null);

  useEffect(() => {
    let cancelled = false;
    setStatus('loading');
    setError(null);

    const timeoutId = setTimeout(
      () => {
        const trimmed = query.trim();
        const request = trimmed.length > 0 ? searchProducts(trimmed) : listProducts();

        request
          .then((result) => {
            if (cancelled) return;
            setProducts(result);
            setStatus(result.length === 0 ? 'empty' : 'success');
          })
          .catch((err) => {
            if (cancelled) return;
            setError(toApiError(err));
            setStatus('error');
          });
      },
      query.trim().length > 0 ? DEBOUNCE_MS : 0,
    );

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, [query]);

  return (
    <View style={styles.container}>
      <View style={styles.searchBar}>
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Ex: Arroz 5kg"
          placeholderTextColor={colors.textMuted}
          style={styles.searchInput}
          autoCapitalize="none"
          accessibilityLabel="Buscar produtos"
          accessibilityHint="Digite o nome do produto que você procura"
          returnKeyType="search"
        />
      </View>

      {status === 'loading' ? <LoadingState label="Buscando produtos…" /> : null}

      {status === 'error' && error ? (
        <ErrorState message={friendlyMessage(error)} onRetry={() => setQuery((q) => q)} />
      ) : null}

      {status === 'empty' ? (
        <EmptyState
          icon="🛒"
          title="Nenhum produto encontrado"
          message={query.trim() ? `Não encontramos resultados para "${query.trim()}"` : 'Ainda não há produtos cadastrados'}
        />
      ) : null}

      {status === 'success' ? (
        <FlatList
          data={products}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <ProductListItem product={item} onPress={() => navigation.navigate('ProductDetail', { productId: item.id })} />
          )}
          ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  searchBar: {
    padding: spacing.lg,
  },
  searchInput: {
    height: 48,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    ...typography.body,
    color: colors.textPrimary,
  },
  list: {
    padding: spacing.lg,
    paddingTop: 0,
  },
});
