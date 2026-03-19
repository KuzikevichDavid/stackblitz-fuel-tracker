import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { AppState } from '@/models/models';
import { useQuery, useRealm } from '@realm/react';
import { StatusBar } from 'expo-status-bar';
import { MoonStarIcon, SunIcon } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import { Platform, StyleSheet, View } from 'react-native';
import ConsumptionRateInput from '@/components/consumption-rate-input';
import { Switch } from '@/components/ui/switch';
import { useCallback } from 'react';

const THEME_ICONS = {
  light: SunIcon,
  dark: MoonStarIcon,
};

export default function SettingsScreen() {
  const realm = useRealm();
  const appState = useQuery(AppState)[0];
  const { colorScheme, setColorScheme } = useColorScheme();

  const onChangeTheme = useCallback(() => {
    console.log(`old scheme =${colorScheme}`);
    const newColorScheme = colorScheme === 'dark' ? 'light' : 'dark';
    setColorScheme(newColorScheme);
    console.log(`new scheme =${newColorScheme}`);

    realm.write(() => {
      appState.theme = newColorScheme;
    });

    console.log(`app theme = ${appState.theme}`);
  }, [colorScheme, setColorScheme, realm, appState]);

  return (
    <View className="max-w-lg flex-col p-4 pb-8">
      <View className="m-2 flex-row p-1">
        <Text className="break-words">
          Switch to{' '}
          <Text className="font-semibold text-primary">
            {colorScheme === 'dark' ? 'light' : 'dark'}
          </Text>{' '}
          color scheme:
        </Text>
        <View style={styles.switch}>
          <Switch
            checked={colorScheme === 'dark'}
            onCheckedChange={onChangeTheme}
            id="dark-scheme"
            nativeID="dark-scheme"
          />
          <Icon as={THEME_ICONS[colorScheme === 'dark' ? 'light' : 'dark']} className="size-5" />
        </View>
      </View>

      <ConsumptionRateInput />

      {/* Use a light status bar on iOS to account for the black space above the modal */}
      <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    // flex: 1,
    // alignItems: 'center',
    // justifyContent: 'center',
    // flexDirection: 'column',
    gap: 5,
  },
  switch: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 1,
  },
});
