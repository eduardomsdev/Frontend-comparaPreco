import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { Badge, Card, ErrorState, LoadingState, Screen } from '../../components/ui';
import { EmptyState } from '../../components/ui/EmptyState';
import { useShoppingList } from '../../contexts/ShoppingListContext';
import { useShoppingListComparison, type EstablishmentTotal } from '../../hooks/useShoppingListComparison';
import { friendlyMessage } from '../../services/api/errors';
import { colors, spacing, typography } from '../../theme';
import { formatCurrencyBRL } from '../../utils/format';

export function ShoppingListComparisonScreen() {
  const { items } = useShoppingList();
  const { status, establishmentTotals, error, refetch, totalItemCount } = useShoppingListComparison(items);

  if (status === 'loading') {
    return <LoadingState label="Calculando o custo da sua lista…" />;
  }

  if (status === 'error') {
    return <ErrorState message={error ? friendlyMessage(error) : 'Não foi possível calcular a comparação.'} onRetry={refetch} />;
  }

  if (status === 'empty') {
    return (
      <EmptyState
        icon="🏬"
        title="Sem dados suficientes"
        message="Adicione produtos à sua lista e aguarde eles terem preços cadastrados em algum estabelecimento."
      />
    );
  }

  const cheapestTotal = establishmentTotals[0]?.total;

  function renderItem({ item, index }: { item: EstablishmentTotal; index: number }) {
    const isCheapest = index === 0;
    const isComplete = item.coveredCount === totalItemCount;

    return (
      <Card style={isCheapest ? styles.cheapestCard : undefined}>
        <View style={styles.rowTop}>
          <Text style={styles.establishmentName} numberOfLines={1}>
            {item.establishmentName}
          </Text>
          {isCheapest ? <Badge label="Mais barato" tone="success" /> : null}
        </View>

        <Text style={[styles.total, isCheapest && styles.totalCheapest]}>{formatCurrencyBRL(item.total)}</Text>

        {!isComplete ? (
          <Text style={styles.missing}>
            Faltam {totalItemCount - item.coveredCount} de {totalItemCount} itens neste estabelecimento
          </Text>
        ) : (
          <Text style={styles.complete}>Todos os {totalItemCount} itens disponíveis</Text>
        )}
      </Card>
    );
  }

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.title}>Onde sai mais barato?</Text>
        <Text style={styles.subtitle}>
          Comparação de {totalItemCount} {totalItemCount === 1 ? 'item' : 'itens'} da sua lista
        </Text>
        {cheapestTotal !== undefined ? (
          <Text style={styles.hint}>Melhor opção: {formatCurrencyBRL(cheapestTotal)}</Text>
        ) : null}
      </View>

      <FlatList
        data={establishmentTotals}
        keyExtractor={(item) => String(item.establishmentId)}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    padding: spacing.lg,
    paddingBottom: spacing.sm,
    gap: 2,
  },
  title: {
    ...typography.title,
    color: colors.textPrimary,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
  },
  hint: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  list: {
    padding: spacing.lg,
    paddingTop: spacing.sm,
  },
  cheapestCard: {
    borderColor: colors.primary,
    borderWidth: 2,
  },
  rowTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  establishmentName: {
    ...typography.subtitle,
    color: colors.textPrimary,
    flexShrink: 1,
  },
  total: {
    ...typography.displayTitle,
    color: colors.textPrimary,
    marginTop: spacing.xs,
  },
  totalCheapest: {
    color: colors.bestPrice,
  },
  missing: {
    ...typography.caption,
    color: colors.warning,
    marginTop: spacing.xs,
  },
  complete: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
});
