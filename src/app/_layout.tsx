/*import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useColorScheme } from 'react-native';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import AppTabs from '@/components/app-tabs';

SplashScreen.preventAutoHideAsync();

export default function TabLayout() {
  const colorScheme = useColorScheme();
  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AnimatedSplashOverlay />
      <AppTabs />
    </ThemeProvider>
  );
}
*/
import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack>
      {/* Le decimos que la pantalla inicial es la carpeta de tabs */}
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      
      {/* Registramos la pantalla dinámica del producto */}
      <Stack.Screen name="producto/[id]" options={{ headerShown: false }} />
    </Stack>
  );
}