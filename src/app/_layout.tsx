/**
 * Iran Gate — Root Layout
 *
 * Handles:
 *  - Auth state hydration on mount
 *  - Theme provider (light/dark)
 *  - Auth guard: redirect to login if no token
 *  - Push notification configuration
 */

import { LoadingScreen } from "@/components/LoadingScreen";
import { useAuthStore } from "@/store/useAuthStore";
import { Palette } from "@/theme";
import { configureNotificationHandler } from "@/utils/notifications";
import {
  DarkTheme,
  DefaultTheme,
  Stack,
  ThemeProvider,
  useRouter,
  useSegments,
} from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { useColorScheme } from "react-native";

// Configure notification display while app is foregrounded
configureNotificationHandler();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const segments = useSegments();
  const { token, isHydrated, hydrate } = useAuthStore();

  // Hydrate auth state from SecureStore on app start
  useEffect(() => {
    hydrate();
  }, [hydrate]);

  // Auth guard — redirect based on auth state
  useEffect(() => {
    if (!isHydrated) return;

    const inAuthGroup = segments[0] === "(auth)";

    if (!token && !inAuthGroup) {
      // Not authenticated — go to login
      router.replace("/(auth)/login");
    } else if (token && inAuthGroup) {
      // Authenticated — go to main tabs
      router.replace("/(tabs)");
    }
  }, [token, isHydrated, segments, router]);

  if (!isHydrated) {
    return <LoadingScreen />;
  }

  // Customize themes to match our brand
  const customLightTheme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      primary: Palette.indigo600,
      background: Palette.gray50,
      card: Palette.white,
      text: Palette.gray900,
      border: Palette.gray200,
    },
  };

  const customDarkTheme = {
    ...DarkTheme,
    colors: {
      ...DarkTheme.colors,
      primary: Palette.indigo400,
      background: Palette.gray950,
      card: Palette.gray900,
      text: Palette.gray50,
      border: Palette.gray700,
    },
  };

  return (
    <ThemeProvider
      value={colorScheme === "dark" ? customDarkTheme : customLightTheme}
    >
      <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="orders/create"
          options={{
            headerShown: true,
            title: "New Order",
            presentation: "modal",
            headerTintColor:
              colorScheme === "dark" ? Palette.gray50 : Palette.gray900,
            headerStyle: {
              backgroundColor:
                colorScheme === "dark" ? Palette.gray900 : Palette.white,
            },
          }}
        />
        <Stack.Screen
          name="orders/[id]"
          options={{
            headerShown: true,
            title: "Order Details",
            headerTintColor:
              colorScheme === "dark" ? Palette.gray50 : Palette.gray900,
            headerStyle: {
              backgroundColor:
                colorScheme === "dark" ? Palette.gray900 : Palette.white,
            },
          }}
        />
      </Stack>
    </ThemeProvider>
  );
}
