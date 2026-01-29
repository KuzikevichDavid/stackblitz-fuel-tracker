import '@/global.css';

import { NAV_THEME } from '@/lib/theme';
import { AppState, realmConfig } from '@/models/models';
import { ThemeProvider } from '@react-navigation/native';
import { RealmProvider, useQuery, useRealm } from '@realm/react';
import { PortalHost } from '@rn-primitives/portal';
import { Stack } from 'expo-router';
import { useColorScheme } from 'nativewind';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '(tabs)',
};

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <RealmProvider {...realmConfig} >
        <RootLayoutNav />
      </RealmProvider>
    </SafeAreaProvider>
  );
}

function RootLayoutNav() {
  const { colorScheme, setColorScheme } = useColorScheme();
  const realm = useRealm();
  const state = useQuery(AppState)[0];
  
  useEffect(() => {
    // Force a specific starting theme (e.g., 'dark') when the app loads
    // You can read the user preference from AsyncStorage here if needed
    setColorScheme(state?.theme ?? 'dark'); // or 'light', or 'system'
    return () => {
      if (realm.isClosed) return;

      realm.write(() => {
        state.isTracking = false;
      });
    };
  }, []);

  return (
    <ThemeProvider value={NAV_THEME[colorScheme ?? 'light']}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="history" options={{ presentation: 'modal' }} />
      </Stack>
      <PortalHost />
    </ThemeProvider>
  );
}
