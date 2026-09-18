import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Badge } from '../ui/Badge';
import { colors, spacing, typography } from '../../theme';
import { formatCurrencyBRL, formatDateTime } from '../../utils/format';
import type { PriceEntry } from '../../schemas/api';

export function PriceRow({ entry, isBest }: { entry: PriceEntry; isBest: boolean }) {
  return (
    <View style={styles.row}>
      <View style={styles.info}>
        <View style={styles.nameLine}>
          <Text style={styles.establishment} numberOfLines={1}>
            {entry.establishmentName}
          </Text>
          {isBest ? <Badge label="Menor preço" tone="success" /> : null}
        </View>
        <Text style={styles.date}>Atualizado em {formatDateTime(entry.collectedAt)}</Text>
      </View>
      <Text style={[styles.price, isBest && styles.priceBest]}>{formatCurrencyBRL(entry.price)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  info: {
    flex: 1,
    gap: 4,
  },
  nameLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  establishment: {
    ...typography.bodyStrong,
    color: colors.textPrimary,
    flexShrink: 1,
  },
  date: {
    ...typography.caption,
    color: colors.textMuted,
  },
  price: {
    ...typography.subtitle,
    color: colors.textPrimary,
  },
  priceBest: {
    color: colors.bestPrice,
  },
});
