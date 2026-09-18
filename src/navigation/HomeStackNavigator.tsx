import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { colors } from '../theme';
import { HomeScreen } from '../screens/home/HomeScreen';
import { ProductSearchScreen } from '../screens/products/ProductSearchScreen';
import { ProductDetailScreen } from '../screens/products/ProductDetailScreen';
import { ShoppingListScreen } from '../screens/shoppingList/ShoppingListScreen';
import { ShoppingListComparisonScreen } from '../screens/shoppingList/ShoppingListComparisonScreen';
import { ReceiptCaptureScreen } from '../screens/receipt/ReceiptCaptureScreen';
import { NewPurchaseScreen } from '../screens/purchases/NewPurchaseScreen';
import { PurchaseHistoryScreen } from '../screens/purchases/PurchaseHistoryScreen';
import { PurchaseDetailScreen } from '../screens/purchases/PurchaseDetailScreen';
import type { HomeStackParamList } from './types';

const Stack = createNativeStackNavigator<HomeStackParamList>();

export function HomeStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerTintColor: colors.primary, headerStyle: { backgroundColor: colors.surface } }}>
      <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
      <Stack.Screen name="ProductSearch" component={ProductSearchScreen} options={{ title: 'Buscar produtos' }} />
      <Stack.Screen name="ProductDetail" component={ProductDetailScreen} options={{ title: 'Produto' }} />
      <Stack.Screen name="ShoppingList" component={ShoppingListScreen} options={{ headerShown: false }} />
      <Stack.Screen name="ShoppingListComparison" component={ShoppingListComparisonScreen} options={{ headerShown: false }} />
      <Stack.Screen name="ReceiptCapture" component={ReceiptCaptureScreen} options={{ title: 'Nota fiscal' }} />
      <Stack.Screen name="NewPurchase" component={NewPurchaseScreen} options={{ title: 'Registrar compra' }} />
      <Stack.Screen name="PurchaseHistory" component={PurchaseHistoryScreen} options={{ headerShown: false }} />
      <Stack.Screen name="PurchaseDetail" component={PurchaseDetailScreen} options={{ title: 'Detalhe da compra' }} />
    </Stack.Navigator>
  );
}
