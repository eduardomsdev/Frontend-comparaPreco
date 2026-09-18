import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { Button, Screen } from '../../components/ui';
import { EmptyState } from '../../components/ui/EmptyState';
import { ShoppingListItemRow } from '../../components/shoppingList/ShoppingListItemRow';
import { useShoppingList } from '../../contexts/ShoppingListContext';
import { colors, spacing, typography } from '../../theme';
import type { HomeStackParamList, ShoppingListStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<ShoppingListStackParamList | HomeStackParamList, 'ShoppingList'>;

export function ShoppingListScreen({ navigation }: Props) {
  const { items, setQuantity, removeItem } = useShoppingList();

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.title}>Minha lista de compras</Text>
        <Text style={styles.subtitle}>
          {items.length === 0 ? 'Sua lista está vazia' : `${items.length} ${items.length === 1 ? 'item' : 'itens'}`}
        </Text>
      </View>

      {items.length === 0 ? (
        <EmptyState
          icon="🧺"
          title="Sua lista está vazia"
          message="Busque produtos e adicione à sua lista para comparar preços depois."
        />
      ) : (
        <>
          <FlatList
            data={items}
            keyExtractor={(item) => String(item.productId)}
            contentContainerStyle={styles.list}
            ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
            renderItem={({ item }) => (
              <ShoppingListItemRow
                item={item}
                onIncrement={() => setQuantity(item.productId, item.quantity + 1)}
                onDecrement={() => setQuantity(item.productId, item.quantity - 1)}
                onRemove={() => removeItem(item.productId)}
              />
            )}
          />
          <View style={styles.footer}>
            <Button label="Comparar preço por estabelecimento" onPress={() => navigation.navigate('ShoppingListComparison')} />
          </View>
        </>
      )}
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
  list: {
    padding: spacing.lg,
    paddingTop: spacing.sm,
  },
  footer: {
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
});
