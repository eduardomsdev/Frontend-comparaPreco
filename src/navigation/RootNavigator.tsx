import { NavigationContainer } from '@react-navigation/native';
import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LoadingState } from '../components/ui';
import { AuthNavigator } from './AuthNavigator';
import { AppTabNavigator } from './AppTabNavigator';

export function RootNavigator() {
  const { status } = useAuth();

  if (status === 'loading') {
    return <LoadingState label="Carregando…" />;
  }

  return <NavigationContainer>{status === 'signedIn' ? <AppTabNavigator /> : <AuthNavigator />}</NavigationContainer>;
}
