import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Badge, Card, Screen } from '../../components/ui';
import { useAuth } from '../../contexts/AuthContext';
import { useShoppingList } from '../../contexts/ShoppingListContext';
import { colors, radius, spacing, typography } from '../../theme';
import type { HomeStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<HomeStackParamList, 'Home'>;

export function HomeScreen({ navigation }: Props) {
  const { user } = useAuth();
  const { items } = useShoppingList();
  const [query, setQuery] = useState('');

  function handleSearch() {
    navigation.navigate('ProductSearch', query.trim() ? { initialQuery: query.trim() } : undefined);
  }

  const firstName = user?.name?.split(' ')[0];

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.container}>
        <View>
          <Text style={styles.greeting}>Olá{firstName ? `, ${firstName}` : ''} 👋</Text>
          <Text style={styles.tagline}>Onde está mais barato hoje?</Text>
        </View>

        <View style={styles.searchBar}>
          <TextInput
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={handleSearch}
            placeholder="Buscar produto, ex: Arroz 5kg"
            placeholderTextColor={colors.textMuted}
            style={styles.searchInput}
            returnKeyType="search"
            accessibilityLabel="Buscar produtos"
          />
          <Pressable
            onPress={handleSearch}
            style={styles.searchButton}
            accessibilityRole="button"
            accessibilityLabel="Buscar"
          >
            <Text style={styles.searchButtonText}>Buscar</Text>
          </Pressable>
        </View>

        <View style={styles.grid}>
          <ActionCard
            icon="🧺"
            title="Lista de compras"
            subtitle={items.length > 0 ? `${items.length} ${items.length === 1 ? 'item' : 'itens'}` : 'Monte sua feira'}
            onPress={() => navigation.navigate('ShoppingList')}
          />
          <ActionCard
            icon="🧾"
            title="Enviar nota fiscal"
            subtitle="Registre uma compra"
            onPress={() => navigation.navigate('ReceiptCapture')}
          />
          <ActionCard
            icon="📍"
            title="Estabelecimentos próximos"
            subtitle="Em breve"
            disabled
          />
          <ActionCard
            icon="📖"
            title="Minhas compras"
            subtitle="Histórico"
            onPress={() => navigation.navigate('PurchaseHistory')}
          />
        </View>
      </ScrollView>
    </Screen>
  );
}

function ActionCard({
  icon,
  title,
  subtitle,
  onPress,
  disabled,
}: {
  icon: string;
  title: string;
  subtitle: string;
  onPress?: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || !onPress}
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled: disabled || !onPress }}
      style={({ pressed }) => [styles.cardWrapper, pressed && !disabled && styles.cardPressed]}
    >
      <Card style={disabled ? styles.cardDisabled : undefined}>
        <Text style={styles.cardIcon}>{icon}</Text>
        <Text style={styles.cardTitle}>{title}</Text>
        <View style={styles.cardSubtitleRow}>
          {disabled ? <Badge label={subtitle} tone="neutral" /> : <Text style={styles.cardSubtitle}>{subtitle}</Text>}
        </View>
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.lg,
    gap: spacing.lg,
  },
  greeting: {
    ...typography.displayTitle,
    color: colors.textPrimary,
  },
  tagline: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: 2,
  },
  searchBar: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  searchInput: {
    flex: 1,
    height: 48,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    ...typography.body,
    color: colors.textPrimary,
  },
  searchButton: {
    height: 48,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchButtonText: {
    ...typography.bodyStrong,
    color: colors.textInverse,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  cardWrapper: {
    width: '47%',
  },
  cardPressed: {
    opacity: 0.8,
  },
  cardDisabled: {
    opacity: 0.6,
  },
  cardIcon: {
    fontSize: 28,
  },
  cardTitle: {
    ...typography.bodyStrong,
    color: colors.textPrimary,
    marginTop: spacing.sm,
  },
  cardSubtitleRow: {
    marginTop: 4,
  },
  cardSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
  },
});
