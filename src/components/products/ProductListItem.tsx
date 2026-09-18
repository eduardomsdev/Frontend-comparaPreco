import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing, typography } from '../../theme';
import { CATEGORY_LABELS, UNIT_LABELS } from '../../utils/labels';
import type { ProductResponse } from '../../schemas/api';

interface Props {
  product: ProductResponse;
  onPress: () => void;
}

export function ProductListItem({ product, onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${product.name}${product.brand ? ', ' + product.brand : ''}`}
      style={({ pressed }) => [styles.container, pressed && styles.pressed]}
    >
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {product.name}
        </Text>
        <Text style={styles.meta} numberOfLines={1}>
          {[product.brand, CATEGORY_LABELS[product.category]].filter(Boolean).join(' · ')}
        </Text>
      </View>
      <Text style={styles.unit}>{UNIT_LABELS[product.unit]}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.sm,
  },
  pressed: {
    opacity: 0.7,
  },
  info: {
    flex: 1,
    gap: 2,
  },
  name: {
    ...typography.bodyStrong,
    color: colors.textPrimary,
  },
  meta: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  unit: {
    ...typography.caption,
    color: colors.textMuted,
    textTransform: 'uppercase',
  },
});
