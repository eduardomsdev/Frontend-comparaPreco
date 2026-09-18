import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button, Card } from '../../components/ui';
import { useAuth } from '../../contexts/AuthContext';
import { colors, spacing, typography } from '../../theme';
import { formatDate } from '../../utils/format';
import type { ProfileStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<ProfileStackParamList, 'Profile'>;

export function ProfileScreen({ navigation }: Props) {
  const { user, signOut } = useAuth();

  function handleSignOut() {
    Alert.alert('Sair', 'Deseja sair da sua conta?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Sair', style: 'destructive', onPress: () => void signOut() },
    ]);
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Card style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{user?.name?.[0]?.toUpperCase() ?? '?'}</Text>
        </View>
        <Text style={styles.name}>{user?.name}</Text>
        <Text style={styles.email}>{user?.email}</Text>
        {user?.createdAt ? <Text style={styles.since}>Na plataforma desde {formatDate(user.createdAt)}</Text> : null}
      </Card>

      <Pressable onPress={() => navigation.navigate('PurchaseHistory')} style={styles.menuItem} accessibilityRole="button">
        <Text style={styles.menuItemText}>Minhas compras</Text>
        <Text style={styles.menuItemChevron}>›</Text>
      </Pressable>

      <Button label="Sair" variant="danger" onPress={handleSignOut} style={styles.signOutButton} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.lg,
    gap: spacing.lg,
    backgroundColor: colors.background,
  },
  profileCard: {
    alignItems: 'center',
    gap: 4,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  avatarText: {
    ...typography.title,
    color: colors.primary,
  },
  name: {
    ...typography.title,
    color: colors.textPrimary,
  },
  email: {
    ...typography.body,
    color: colors.textSecondary,
  },
  since: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  menuItemText: {
    ...typography.bodyStrong,
    color: colors.textPrimary,
  },
  menuItemChevron: {
    ...typography.title,
    color: colors.textMuted,
  },
  signOutButton: {
    marginTop: spacing.md,
  },
});
