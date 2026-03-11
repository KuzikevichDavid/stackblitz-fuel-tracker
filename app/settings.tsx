import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { AppState } from '@/models/models';
import { useQuery, useRealm } from '@realm/react';
import { StatusBar } from 'expo-status-bar';
import { MoonStarIcon, SunIcon } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const THEME_ICONS = {
  light: SunIcon,
  dark: MoonStarIcon,
};

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const realm = useRealm();
  const appState = useQuery(AppState)[0];
  const { colorScheme, setColorScheme } = useColorScheme();

  return (
    <View
      style={{
        paddingBottom: insets.bottom,
        ...styles.container,
      }}>
      <Text style={styles.title}>Application settings</Text>

      <View style={styles.container}>
        <Pressable
          onPress={() => {
            // toggleColorScheme();
            console.log(`old scheme =${colorScheme}`);
            const newColorScheme = colorScheme === 'dark' ? 'light' : 'dark'
            setColorScheme(newColorScheme);
            console.log(`new scheme =${newColorScheme}`);

            realm.write(() => {
              appState.theme = newColorScheme;
            });

            console.log(`app theme = ${appState.theme}`);
          }}
          // size="icon"
          // variant="ghost"
          className="ios:size-9 rounded-full web:mx-4">
          <Icon as={THEME_ICONS[colorScheme ?? 'light']} className="size-5" />
        </Pressable>
      </View>
      
      {/* Use a light status bar on iOS to account for the black space above the modal */}
      <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
    </View>
  );
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
      gap: 5,
    },
    title: {
      fontSize: 20,
      fontWeight: 'bold',
    },
  });
