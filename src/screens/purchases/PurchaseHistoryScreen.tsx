import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useCallback } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { Badge, Button, ErrorState, LoadingState, Screen } from '../../components/ui';
import { EmptyState } from '../../components/ui/EmptyState';
import { useAsyncResource } from '../../hooks/useAsyncResource';
import { listMyPurchases } from '../../services/api/purchasesApi';
import { friendlyMessage } from '../../services/api/errors';
import { colors, radius, spacing, typography } from '../../theme';
import { formatCurrencyBRL, formatDateTime } from '../../utils/format';
import { PURCHASE_STATUS_LABELS } from '../../utils/labels';
import type { PurchaseResponse } from '../../schemas/api';
import type { HomeStackParamList, ProfileStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<HomeStackParamList | ProfileStackParamList, 'PurchaseHistory'>;

export function PurchaseHistoryScreen({ navigation }: Props) {
  const fetcher = useCallback(() => listMyPurchases(), []);
  const { status, data, error, refetch } = useAsyncResource<PurchaseResponse[]>(fetcher, [], {
    isEmpty: (list) => list.length === 0,
  });

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.title}>Minhas compras</Text>
        <Button label="Registrar compra" variant="secondary" onPress={() => navigation.navigate('NewPurchase')} />
      </View>

      {status === 'loading' ? <LoadingState label="Carregando compras…" /> : null}

      {status === 'error' ? (
        <ErrorState message={error ? friendlyMessage(error) : 'Não foi possível carregar suas compras.'} onRetry={refetch} />
      ) : null}

      {status === 'empty' ? (
        <EmptyState
          icon="🧾"
          title="Nenhuma compra registrada"
          message="Registre uma compra manualmente para começar a acompanhar seus gastos."
          actionLabel="Registrar compra"
          onAction={() => navigation.navigate('NewPurchase')}
        />
      ) : null}

      {status === 'success' && data ? (
        <FlatList
          data={data}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.list}
          ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => navigation.navigate('PurchaseDetail', { purchaseId: item.id })}
              style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
              accessibilityRole="button"
            >
              <View style={styles.rowInfo}>
                <Text style={styles.establishment} numberOfLines={1}>
                  {item.establishmentName}
                </Text>
                <Text style={styles.date}>{formatDateTime(item.purchaseDate)}</Text>
              </View>
              <View style={styles.rowRight}>
                <Text style={styles.total}>{formatCurrencyBRL(item.totalValue)}</Text>
                <Badge label={PURCHASE_STATUS_LABELS[item.status]} tone="neutral" />
              </View>
            </Pressable>
          )}
        />
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  title: {
    ...typography.title,
    color: colors.textPrimary,
  },
  list: {
    padding: spacing.lg,
    paddingTop: 0,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.sm,
  },
  rowPressed: {
    opacity: 0.7,
  },
  rowInfo: {
    flex: 1,
    gap: 2,
  },
  establishment: {
    ...typography.bodyStrong,
    color: colors.textPrimary,
  },
  date: {
    ...typography.caption,
    color: colors.textMuted,
  },
  rowRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  total: {
    ...typography.bodyStrong,
    color: colors.textPrimary,
  },
});
