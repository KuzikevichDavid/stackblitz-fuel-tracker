import '@/global.css';

import { NAV_THEME } from '@/lib/theme';
import { AppState, LocationPoint, Trip } from '@/models/models';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { RealmProvider, useQuery, useRealm } from '@realm/react';
import { PortalHost } from '@rn-primitives/portal';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useColorScheme } from 'nativewind';
import { useEffect } from 'react';
import Realm from "realm";
import 'react-native-reanimated';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '(tabs)',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
// SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  /* const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  } */

  return (
    <RealmProvider schema={[Trip, LocationPoint, AppState]} >
      <RootLayoutNav />
    </RealmProvider>
  );
}

function RootLayoutNav() {
  const { colorScheme, setColorScheme } = useColorScheme();
  const realm = useRealm();
  const state = useQuery(AppState)[0];

  if (!state) {
    realm.write(() => {
      realm.create('AppState', {
        _id: new Realm.BSON.ObjectId(),
        theme: "dark",
        lastTripId: '',
        // isLoggedIn: false,
      });
    });
  }
  
  useEffect(() => {
    // Force a specific starting theme (e.g., 'dark') when the app loads
    // You can read the user preference from AsyncStorage here if needed
    setColorScheme(state?.theme ?? 'dark'); // or 'light', or 'system'
  }, []);

  return (
    <ThemeProvider value={NAV_THEME[colorScheme ?? 'light']}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
      </Stack>
      <PortalHost />
    </ThemeProvider>
  );
}
