import { Stack } from 'expo-router';
import { PreferencesProvider } from '../context/PreferencesContext';
import { AuthProvider } from '../context/AuthContext';
import { FavoritesProvider } from '../context/FavoritesContext';
import { CartProvider } from '../context/CartContext';

export default function RootLayout() {
  return (
    <PreferencesProvider>
      <AuthProvider>
        <FavoritesProvider>
          <CartProvider>
            <Stack>
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="producto/[id]" options={{ headerShown: false }} />
            </Stack>
          </CartProvider>
        </FavoritesProvider>
      </AuthProvider>
    </PreferencesProvider>
  );
}