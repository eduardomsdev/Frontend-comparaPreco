import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button, Card, ErrorState, LoadingState } from '../../components/ui';
import { EmptyState } from '../../components/ui/EmptyState';
import { PriceRow } from '../../components/products/PriceRow';
import { useAsyncResource } from '../../hooks/useAsyncResource';
import { useShoppingList } from '../../contexts/ShoppingListContext';
import { getProduct, getProductPriceComparison } from '../../services/api/productsApi';
import { friendlyMessage } from '../../services/api/errors';
import { colors, spacing, typography } from '../../theme';
import { CATEGORY_LABELS, UNIT_LABELS } from '../../utils/labels';
import type { ProductPriceComparison, ProductResponse } from '../../schemas/api';
import type { HomeStackParamList, ProductsStackParamList, ShoppingListStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<
  ProductsStackParamList | HomeStackParamList | ShoppingListStackParamList,
  'ProductDetail'
>;

interface ProductDetailData {
  product: ProductResponse;
  comparison: ProductPriceComparison;
}

export function ProductDetailScreen({ route }: Props) {
  const { productId } = route.params;
  const { addProduct, items } = useShoppingList();
  const [justAdded, setJustAdded] = useState(false);

  const fetcher = useCallback(
    () => Promise.all([getProduct(productId), getProductPriceComparison(productId)]).then(([product, comparison]) => ({ product, comparison })),
    [productId],
  );

  const { status, data, error, refetch } = useAsyncResource<ProductDetailData>(fetcher, [productId]);

  if (status === 'loading') {
    return <LoadingState label="Carregando produto…" />;
  }

  if (status === 'error' || !data) {
    return <ErrorState message={error ? friendlyMessage(error) : 'Não foi possível carregar o produto.'} onRetry={refetch} />;
  }

  const { product, comparison } = data;
  const alreadyInList = items.some((item) => item.productId === product.id);

  function handleAdd() {
    addProduct(product);
    setJustAdded(true);
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.name}>{product.name}</Text>
        {product.brand ? <Text style={styles.brand}>{product.brand}</Text> : null}
        <View style={styles.metaRow}>
          <Text style={styles.metaTag}>{CATEGORY_LABELS[product.category]}</Text>
          <Text style={styles.metaDot}>·</Text>
          <Text style={styles.metaTag}>{UNIT_LABELS[product.unit]}</Text>
        </View>
        {product.description ? <Text style={styles.description}>{product.description}</Text> : null}
      </View>

      <Button
        label={justAdded || alreadyInList ? 'Na sua lista ✓' : 'Adicionar à lista de compras'}
        onPress={handleAdd}
        variant={justAdded || alreadyInList ? 'secondary' : 'primary'}
        disabled={justAdded || alreadyInList}
      />

      <Card>
        <Text style={styles.sectionTitle}>Preços encontrados</Text>
        {comparison.prices.length === 0 ? (
          <EmptyState
            icon="💸"
            title="Ainda sem preços"
            message="Nenhum estabelecimento informou o preço deste produto ainda."
          />
        ) : (
          comparison.prices.map((entry, index) => (
            <React.Fragment key={entry.establishmentId}>
              {index > 0 ? <View style={styles.separator} /> : null}
              <PriceRow entry={entry} isBest={comparison.bestPrice?.establishmentId === entry.establishmentId} />
            </React.Fragment>
          ))
        )}
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.lg,
    gap: spacing.lg,
    backgroundColor: colors.background,
  },
  header: {
    gap: spacing.xs,
  },
  name: {
    ...typography.title,
    color: colors.textPrimary,
  },
  brand: {
    ...typography.body,
    color: colors.textSecondary,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  metaTag: {
    ...typography.caption,
    color: colors.textMuted,
  },
  metaDot: {
    color: colors.textMuted,
  },
  description: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
  sectionTitle: {
    ...typography.subtitle,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  separator: {
    height: 1,
    backgroundColor: colors.border,
  },
});
