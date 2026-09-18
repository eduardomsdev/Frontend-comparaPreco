import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { colors } from '../theme';
import { ProductSearchScreen } from '../screens/products/ProductSearchScreen';
import { ProductDetailScreen } from '../screens/products/ProductDetailScreen';
import type { ProductsStackParamList } from './types';

const Stack = createNativeStackNavigator<ProductsStackParamList>();

export function ProductsStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerTintColor: colors.primary, headerStyle: { backgroundColor: colors.surface } }}>
      <Stack.Screen name="ProductSearch" component={ProductSearchScreen} options={{ title: 'Buscar produtos' }} />
      <Stack.Screen name="ProductDetail" component={ProductDetailScreen} options={{ title: 'Produto' }} />
    </Stack.Navigator>
  );
}
