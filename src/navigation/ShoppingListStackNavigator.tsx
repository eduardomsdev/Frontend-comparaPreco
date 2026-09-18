import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { colors } from '../theme';
import { ShoppingListScreen } from '../screens/shoppingList/ShoppingListScreen';
import { ShoppingListComparisonScreen } from '../screens/shoppingList/ShoppingListComparisonScreen';
import { ProductDetailScreen } from '../screens/products/ProductDetailScreen';
import type { ShoppingListStackParamList } from './types';

const Stack = createNativeStackNavigator<ShoppingListStackParamList>();

export function ShoppingListStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerTintColor: colors.primary, headerStyle: { backgroundColor: colors.surface } }}>
      <Stack.Screen name="ShoppingList" component={ShoppingListScreen} options={{ headerShown: false }} />
      <Stack.Screen name="ShoppingListComparison" component={ShoppingListComparisonScreen} options={{ title: 'Comparação' }} />
      <Stack.Screen name="ProductDetail" component={ProductDetailScreen} options={{ title: 'Produto' }} />
    </Stack.Navigator>
  );
}
