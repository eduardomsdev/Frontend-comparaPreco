import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/contexts/AuthContext';
import { ShoppingListProvider } from './src/contexts/ShoppingListContext';
import { RootNavigator } from './src/navigation/RootNavigator';

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <ShoppingListProvider>
          <RootNavigator />
          <StatusBar style="dark" />
        </ShoppingListProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
