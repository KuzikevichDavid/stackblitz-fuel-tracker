import { ScreenContent } from 'components/ScreenContent';
import { StatusBar } from 'expo-status-bar';

import './global.css';
import { NAV_THEME } from '@/lib/theme';
import { ThemeProvider } from '@react-navigation/native';
import { PortalHost } from '@rn-primitives/portal';
import { useColorScheme } from 'nativewind';

export default function App() {
  const { colorScheme } = useColorScheme();
  
  return (
    <ThemeProvider value={NAV_THEME[colorScheme ?? 'light']}>
      <ScreenContent title="Home" path="App.tsx"></ScreenContent>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      <PortalHost />
    </ThemeProvider>
  );
}
