import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React from 'react';
import { Text } from 'react-native';
import { colors } from '../theme';
import { HomeStackNavigator } from './HomeStackNavigator';
import { ProductsStackNavigator } from './ProductsStackNavigator';
import { ShoppingListStackNavigator } from './ShoppingListStackNavigator';
import { ProfileStackNavigator } from './ProfileStackNavigator';
import type { AppTabParamList } from './types';

const Tab = createBottomTabNavigator<AppTabParamList>();

const TAB_ICONS: Record<keyof AppTabParamList, string> = {
  HomeTab: '🏠',
  ProductsTab: '🔍',
  ShoppingListTab: '🧺',
  ProfileTab: '👤',
};

export function AppTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarIcon: () => <Text style={{ fontSize: 20 }}>{TAB_ICONS[route.name as keyof AppTabParamList]}</Text>,
      })}
    >
      <Tab.Screen name="HomeTab" component={HomeStackNavigator} options={{ title: 'Início' }} />
      <Tab.Screen name="ProductsTab" component={ProductsStackNavigator} options={{ title: 'Buscar' }} />
      <Tab.Screen name="ShoppingListTab" component={ShoppingListStackNavigator} options={{ title: 'Lista' }} />
      <Tab.Screen name="ProfileTab" component={ProfileStackNavigator} options={{ title: 'Perfil' }} />
    </Tab.Navigator>
  );
}
