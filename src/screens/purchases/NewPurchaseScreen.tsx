import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Button, Card, ErrorState, LoadingState } from '../../components/ui';
import { listEstablishments } from '../../services/api/establishmentsApi';
import { searchProducts } from '../../services/api/productsApi';
import { createPurchase } from '../../services/api/purchasesApi';
import { friendlyMessage, toApiError } from '../../services/api/errors';
import { colors, radius, spacing, typography } from '../../theme';
import { formatCurrencyBRL } from '../../utils/format';
import { ESTABLISHMENT_TYPE_LABELS } from '../../utils/labels';
import type { EstablishmentResponse, ProductResponse } from '../../schemas/api';
import type { HomeStackParamList, ProfileStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<HomeStackParamList | ProfileStackParamList, 'NewPurchase'>;

interface DraftItem {
  productId: number;
  productName: string;
  quantity: string;
  unitPrice: string;
}

function parseDecimal(value: string): number {
  return Number(value.replace(',', '.'));
}

export function NewPurchaseScreen({ navigation }: Props) {
  const [establishments, setEstablishments] = useState<EstablishmentResponse[] | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [selectedEstablishmentId, setSelectedEstablishmentId] = useState<number | null>(null);

  const [productQuery, setProductQuery] = useState('');
  const [suggestions, setSuggestions] = useState<ProductResponse[]>([]);
  const [pendingProduct, setPendingProduct] = useState<ProductResponse | null>(null);
  const [pendingQuantity, setPendingQuantity] = useState('1');
  const [pendingPrice, setPendingPrice] = useState('');

  const [items, setItems] = useState<DraftItem[]>([]);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    listEstablishments()
      .then(setEstablishments)
      .catch(() => setLoadError(true));
  }, []);

  useEffect(() => {
    if (productQuery.trim().length < 2) {
      setSuggestions([]);
      return;
    }
    let cancelled = false;
    const timeoutId = setTimeout(() => {
      searchProducts(productQuery.trim())
        .then((result) => {
          if (!cancelled) setSuggestions(result.slice(0, 5));
        })
        .catch(() => {
          if (!cancelled) setSuggestions([]);
        });
    }, 350);
    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, [productQuery]);

  function handleSelectProduct(product: ProductResponse) {
    setPendingProduct(product);
    setSuggestions([]);
    setProductQuery(product.name);
  }

  function handleAddItem() {
    if (!pendingProduct) return;
    const quantity = parseDecimal(pendingQuantity);
    const unitPrice = parseDecimal(pendingPrice);
    if (!(quantity > 0) || !(unitPrice > 0)) return;

    setItems((prev) => [
      ...prev,
      { productId: pendingProduct.id, productName: pendingProduct.name, quantity: String(quantity), unitPrice: String(unitPrice) },
    ]);
    setPendingProduct(null);
    setProductQuery('');
    setPendingQuantity('1');
    setPendingPrice('');
  }

  function handleRemoveItem(productId: number) {
    setItems((prev) => prev.filter((item) => item.productId !== productId));
  }

  const estimatedTotal = items.reduce((sum, item) => sum + parseDecimal(item.quantity) * parseDecimal(item.unitPrice), 0);
  const canSubmit = selectedEstablishmentId !== null && items.length > 0 && !isSubmitting;

  async function handleSubmit() {
    if (!selectedEstablishmentId) return;
    setSubmitError(null);
    setIsSubmitting(true);
    try {
      const purchase = await createPurchase({
        establishmentId: selectedEstablishmentId,
        items: items.map((item) => ({
          productId: item.productId,
          quantity: parseDecimal(item.quantity),
          unitPrice: parseDecimal(item.unitPrice),
        })),
      });
      navigation.replace('PurchaseDetail', { purchaseId: purchase.id });
    } catch (err) {
      setSubmitError(friendlyMessage(toApiError(err)));
    } finally {
      setIsSubmitting(false);
    }
  }

  if (loadError) {
    return <ErrorState message="Não foi possível carregar os estabelecimentos." onRetry={() => setLoadError(false)} />;
  }

  if (!establishments) {
    return <LoadingState label="Carregando…" />;
  }

  const selectedEstablishment = establishments.find((e) => e.id === selectedEstablishmentId) ?? null;

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Card>
        <Text style={styles.sectionTitle}>Estabelecimento</Text>
        {selectedEstablishment ? (
          <View style={styles.selectedEstablishment}>
            <Text style={styles.selectedEstablishmentName}>{selectedEstablishment.name}</Text>
            <Pressable onPress={() => setSelectedEstablishmentId(null)}>
              <Text style={styles.changeLink}>Trocar</Text>
            </Pressable>
          </View>
        ) : establishments.length === 0 ? (
          <Text style={styles.emptyHint}>Nenhum estabelecimento cadastrado ainda.</Text>
        ) : (
          <View style={styles.establishmentList}>
            {establishments.map((establishment) => (
              <Pressable
                key={establishment.id}
                onPress={() => setSelectedEstablishmentId(establishment.id)}
                style={styles.establishmentRow}
                accessibilityRole="button"
              >
                <Text style={styles.establishmentName}>{establishment.name}</Text>
                <Text style={styles.establishmentType}>{ESTABLISHMENT_TYPE_LABELS[establishment.type]}</Text>
              </Pressable>
            ))}
          </View>
        )}
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>Adicionar item</Text>
        <TextInput
          value={productQuery}
          onChangeText={(text) => {
            setProductQuery(text);
            setPendingProduct(null);
          }}
          placeholder="Buscar produto"
          placeholderTextColor={colors.textMuted}
          style={styles.input}
          accessibilityLabel="Buscar produto para adicionar"
        />
        {suggestions.length > 0 ? (
          <View style={styles.suggestions}>
            {suggestions.map((product) => (
              <Pressable key={product.id} onPress={() => handleSelectProduct(product)} style={styles.suggestionRow}>
                <Text style={styles.suggestionText}>{product.name}</Text>
              </Pressable>
            ))}
          </View>
        ) : null}

        {pendingProduct ? (
          <View style={styles.pendingRow}>
            <TextInput
              value={pendingQuantity}
              onChangeText={setPendingQuantity}
              placeholder="Qtd"
              keyboardType="decimal-pad"
              style={[styles.input, styles.smallInput]}
              accessibilityLabel="Quantidade"
            />
            <TextInput
              value={pendingPrice}
              onChangeText={setPendingPrice}
              placeholder="Preço unitário"
              keyboardType="decimal-pad"
              style={[styles.input, styles.smallInput]}
              accessibilityLabel="Preço unitário"
            />
            <Button label="Adicionar" onPress={handleAddItem} style={styles.addButton} />
          </View>
        ) : null}
      </Card>

      {items.length > 0 ? (
        <Card>
          <Text style={styles.sectionTitle}>Itens da compra</Text>
          {items.map((item, index) => (
            <React.Fragment key={item.productId}>
              {index > 0 ? <View style={styles.separator} /> : null}
              <View style={styles.itemRow}>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName} numberOfLines={1}>
                    {item.productName}
                  </Text>
                  <Text style={styles.itemMeta}>
                    {item.quantity} × {formatCurrencyBRL(parseDecimal(item.unitPrice))}
                  </Text>
                </View>
                <Pressable onPress={() => handleRemoveItem(item.productId)}>
                  <Text style={styles.removeText}>Remover</Text>
                </Pressable>
              </View>
            </React.Fragment>
          ))}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total estimado</Text>
            <Text style={styles.totalValue}>{formatCurrencyBRL(estimatedTotal)}</Text>
          </View>
        </Card>
      ) : null}

      {submitError ? (
        <Text style={styles.submitError} accessibilityRole="alert">
          {submitError}
        </Text>
      ) : null}

      <Button label="Registrar compra" onPress={handleSubmit} disabled={!canSubmit} loading={isSubmitting} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.lg,
    gap: spacing.lg,
    backgroundColor: colors.background,
  },
  sectionTitle: {
    ...typography.subtitle,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  selectedEstablishment: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectedEstablishmentName: {
    ...typography.bodyStrong,
    color: colors.textPrimary,
  },
  changeLink: {
    ...typography.caption,
    color: colors.primary,
  },
  emptyHint: {
    ...typography.body,
    color: colors.textSecondary,
  },
  establishmentList: {
    gap: spacing.xs,
  },
  establishmentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  establishmentName: {
    ...typography.body,
    color: colors.textPrimary,
  },
  establishmentType: {
    ...typography.caption,
    color: colors.textMuted,
  },
  input: {
    height: 44,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.md,
    ...typography.body,
    color: colors.textPrimary,
  },
  suggestions: {
    marginTop: spacing.xs,
    gap: 2,
  },
  suggestionRow: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    backgroundColor: colors.primaryLight,
    borderRadius: radius.sm,
  },
  suggestionText: {
    ...typography.body,
    color: colors.textPrimary,
  },
  pendingRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
    alignItems: 'center',
  },
  smallInput: {
    flex: 1,
  },
  addButton: {
    minHeight: 44,
  },
  separator: {
    height: 1,
    backgroundColor: colors.border,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  itemInfo: {
    flex: 1,
    gap: 2,
  },
  itemName: {
    ...typography.bodyStrong,
    color: colors.textPrimary,
  },
  itemMeta: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  removeText: {
    ...typography.caption,
    color: colors.danger,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  totalLabel: {
    ...typography.subtitle,
    color: colors.textPrimary,
  },
  totalValue: {
    ...typography.subtitle,
    color: colors.primary,
  },
  submitError: {
    ...typography.caption,
    color: colors.danger,
    textAlign: 'center',
  },
});
