import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing, typography } from '../../theme';
import { UNIT_LABELS } from '../../utils/labels';
import type { ShoppingListItem } from '../../contexts/ShoppingListContext';

interface Props {
  item: ShoppingListItem;
  onIncrement: () => void;
  onDecrement: () => void;
  onRemove: () => void;
}

export function ShoppingListItemRow({ item, onIncrement, onDecrement, onRemove }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {item.name}
        </Text>
        {item.brand ? (
          <Text style={styles.brand} numberOfLines={1}>
            {item.brand}
          </Text>
        ) : null}
      </View>

      <View style={styles.stepper}>
        <Pressable
          onPress={onDecrement}
          accessibilityRole="button"
          accessibilityLabel={`Diminuir quantidade de ${item.name}`}
          style={styles.stepperButton}
        >
          <Text style={styles.stepperButtonText}>−</Text>
        </Pressable>
        <Text style={styles.quantity}>
          {item.quantity} {UNIT_LABELS[item.unit]}
        </Text>
        <Pressable
          onPress={onIncrement}
          accessibilityRole="button"
          accessibilityLabel={`Aumentar quantidade de ${item.name}`}
          style={styles.stepperButton}
        >
          <Text style={styles.stepperButtonText}>+</Text>
        </Pressable>
      </View>

      <Pressable onPress={onRemove} accessibilityRole="button" accessibilityLabel={`Remover ${item.name} da lista`} hitSlop={8}>
        <Text style={styles.removeText}>Remover</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.sm,
  },
  info: {
    gap: 2,
  },
  name: {
    ...typography.bodyStrong,
    color: colors.textPrimary,
  },
  brand: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  stepperButton: {
    width: 32,
    height: 32,
    borderRadius: radius.full,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperButtonText: {
    ...typography.subtitle,
    color: colors.primary,
  },
  quantity: {
    ...typography.bodyStrong,
    color: colors.textPrimary,
    minWidth: 64,
    textAlign: 'center',
  },
  removeText: {
    ...typography.caption,
    color: colors.danger,
    textAlign: 'right',
  },
});
