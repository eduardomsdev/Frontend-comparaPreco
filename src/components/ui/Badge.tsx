import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing, typography } from '../../theme';

type BadgeTone = 'neutral' | 'success' | 'warning' | 'danger';

export function Badge({ label, tone = 'neutral' }: { label: string; tone?: BadgeTone }) {
  return (
    <View style={[styles.badge, toneStyles[tone].container]}>
      <Text style={[styles.label, toneStyles[tone].text]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.full,
  },
  label: {
    ...typography.overline,
  },
});

const toneStyles: Record<BadgeTone, { container: object; text: object }> = {
  neutral: { container: { backgroundColor: colors.border }, text: { color: colors.textSecondary } },
  success: { container: { backgroundColor: colors.successLight }, text: { color: colors.success } },
  warning: { container: { backgroundColor: colors.warningLight }, text: { color: colors.warning } },
  danger: { container: { backgroundColor: colors.dangerLight }, text: { color: colors.danger } },
};
