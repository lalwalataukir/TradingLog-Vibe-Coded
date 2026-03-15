import { initializeDatabase } from '@/db/migrate';
import { seedDatabase } from '@/db/seed';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { useColorScheme } from 'react-native';
import 'react-native-reanimated';

SplashScreen.preventAutoHideAsync();

// Initialize DB synchronously before React renders
try {
  initializeDatabase();
  seedDatabase();
} catch (e) {
  console.warn('DB init error:', e);
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) return null;

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="trades/new"
          options={{ presentation: 'modal', headerShown: false }}
        />
        <Stack.Screen
          name="trades/[id]/index"
          options={{ presentation: 'card', headerShown: false }}
        />
        <Stack.Screen
          name="trades/[id]/close"
          options={{ presentation: 'modal', headerShown: false }}
        />
        <Stack.Screen
          name="rules"
          options={{ presentation: 'card', headerShown: false }}
        />
        <Stack.Screen
          name="settings"
          options={{ presentation: 'card', headerShown: false }}
        />
      </Stack>
    </ThemeProvider>
  );
}
