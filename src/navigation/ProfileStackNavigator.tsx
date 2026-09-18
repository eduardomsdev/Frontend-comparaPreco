import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { colors } from '../theme';
import { ProfileScreen } from '../screens/profile/ProfileScreen';
import { PurchaseHistoryScreen } from '../screens/purchases/PurchaseHistoryScreen';
import { PurchaseDetailScreen } from '../screens/purchases/PurchaseDetailScreen';
import { NewPurchaseScreen } from '../screens/purchases/NewPurchaseScreen';
import type { ProfileStackParamList } from './types';

const Stack = createNativeStackNavigator<ProfileStackParamList>();

export function ProfileStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerTintColor: colors.primary, headerStyle: { backgroundColor: colors.surface } }}>
      <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: 'Perfil' }} />
      <Stack.Screen name="PurchaseHistory" component={PurchaseHistoryScreen} options={{ headerShown: false }} />
      <Stack.Screen name="PurchaseDetail" component={PurchaseDetailScreen} options={{ title: 'Detalhe da compra' }} />
      <Stack.Screen name="NewPurchase" component={NewPurchaseScreen} options={{ title: 'Registrar compra' }} />
    </Stack.Navigator>
  );
}
