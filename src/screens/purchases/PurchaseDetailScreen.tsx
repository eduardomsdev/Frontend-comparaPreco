import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useCallback } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Badge, Card, ErrorState, LoadingState } from '../../components/ui';
import { useAsyncResource } from '../../hooks/useAsyncResource';
import { getPurchase } from '../../services/api/purchasesApi';
import { friendlyMessage } from '../../services/api/errors';
import { colors, spacing, typography } from '../../theme';
import { formatCurrencyBRL, formatDateTime } from '../../utils/format';
import { PURCHASE_STATUS_LABELS } from '../../utils/labels';
import type { PurchaseResponse } from '../../schemas/api';
import type { HomeStackParamList, ProfileStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<HomeStackParamList | ProfileStackParamList, 'PurchaseDetail'>;

export function PurchaseDetailScreen({ route }: Props) {
  const { purchaseId } = route.params;
  const fetcher = useCallback(() => getPurchase(purchaseId), [purchaseId]);
  const { status, data, error, refetch } = useAsyncResource<PurchaseResponse>(fetcher, [purchaseId]);

  if (status === 'loading') {
    return <LoadingState label="Carregando compra…" />;
  }

  if (status === 'error' || !data) {
    return (
      <ErrorState
        message={error ? friendlyMessage(error) : 'Não foi possível carregar esta compra.'}
        onRetry={refetch}
      />
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.establishment}>{data.establishmentName}</Text>
        <Text style={styles.date}>{formatDateTime(data.purchaseDate)}</Text>
        <Badge label={PURCHASE_STATUS_LABELS[data.status]} tone="neutral" />
      </View>

      <Card>
        <Text style={styles.sectionTitle}>Itens</Text>
        {data.items.map((item, index) => (
          <React.Fragment key={item.id}>
            {index > 0 ? <View style={styles.separator} /> : null}
            <View style={styles.itemRow}>
              <View style={styles.itemInfo}>
                <Text style={styles.itemName} numberOfLines={2}>
                  {item.productName}
                </Text>
                <Text style={styles.itemMeta}>
                  {item.quantity} × {formatCurrencyBRL(item.unitPrice)}
                </Text>
              </View>
              <Text style={styles.itemTotal}>{formatCurrencyBRL(item.totalPrice)}</Text>
            </View>
          </React.Fragment>
        ))}
      </Card>

      <Card style={styles.totalCard}>
        <Text style={styles.totalLabel}>Total</Text>
        <Text style={styles.totalValue}>{formatCurrencyBRL(data.totalValue)}</Text>
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
  establishment: {
    ...typography.title,
    color: colors.textPrimary,
  },
  date: {
    ...typography.body,
    color: colors.textSecondary,
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
  itemTotal: {
    ...typography.bodyStrong,
    color: colors.textPrimary,
  },
  totalCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    ...typography.subtitle,
    color: colors.textPrimary,
  },
  totalValue: {
    ...typography.title,
    color: colors.primary,
  },
});
