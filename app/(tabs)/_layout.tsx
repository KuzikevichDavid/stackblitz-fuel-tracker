import React from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Link, Tabs } from 'expo-router';
import { Pressable, StyleSheet } from 'react-native';
import { useColorScheme } from 'nativewind';
import { NAV_THEME } from '@/lib/theme';
import { Icon } from '@/components/ui/icon';
import { Fuel, MoonStarIcon, SunIcon } from 'lucide-react-native';
import { useQuery, useRealm } from '@realm/react';
import { AppState } from '@/models/models';
import { Theme } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// You can explore the built-in icon families and icons on the web at https://icons.expo.fyi/
function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
}) {
  return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
  const scheme = useColorScheme();
  const realm = useRealm();
  const appState = useQuery(AppState)[0];
  const { colorScheme } = scheme;
  const theme = NAV_THEME[colorScheme ?? 'light'];
  const { colors } = theme;
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        headerLeft: () => <Fuel className="h-8 w-8" color={colors.primary} />,
        headerRight: () => (
          <HeaderRight
            theme={theme}
            realm={realm}
            appState={appState}
            scheme={scheme}
            insets={insets}
          />
        ),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Fuel Tracker',
          tabBarIcon: ({ color }) => <TabBarIcon name="truck" color={color} />,
        }}
      />
      <Tabs.Screen
        name="map"
        options={{
          title: 'Map',
          tabBarIcon: ({ color }) => <TabBarIcon name="map" color={color} />,
        }}
      />
    </Tabs>
  );
}

const THEME_ICONS = {
  light: SunIcon,
  dark: MoonStarIcon,
};

function ThemeToggle({
  scheme,
  realm,
  appState,
}: Required<Pick<Props, 'scheme' | 'realm' | 'appState'>>) {
  const { colorScheme /* , toggleColorScheme */, setColorScheme } = scheme;

  return (
    <Pressable
      onPress={() => {
        // toggleColorScheme();
        setColorScheme(colorScheme === 'dark' ? 'light' : 'dark');
        console.log(`toggle =${colorScheme === 'dark' ? 'light' : 'dark'}`);

        realm.write(() => {
          appState.theme = colorScheme === 'dark' ? 'light' : 'dark';
        });

        console.log(`app theme = ${appState.theme}`);
      }}
      // size="icon"
      // variant="ghost"
      className="ios:size-9 rounded-full web:mx-4">
      <Icon as={THEME_ICONS[colorScheme ?? 'light']} className="size-5" style={styles.themeIcon} />
    </Pressable>
  );
}

interface Props {
  theme: Pick<Theme, 'colors'>;
  scheme?: ReturnType<typeof useColorScheme>;
  realm?: ReturnType<typeof useRealm>;
  appState?: AppState;
  insets?: ReturnType<typeof useSafeAreaInsets>;
}

function HeaderRight(props: Props) {
  const {
    theme: { colors },
    scheme,
    appState,
    realm,
    insets,
  } = props;

  return (
    <>
      {/* <View style={{marginRight: insets!.right}}> */}
      <ThemeToggle scheme={scheme!} realm={realm!} appState={appState!} />
      <Link href="../history" asChild>
        <Pressable>
          {({ pressed }) => {
            console.log(`history link pressed? ${pressed}`);

            return (
              <FontAwesome
                name="history"
                size={25}
                color={colors.text}
                style={{
                  marginLeft: 15,
                  marginRight: insets!.right,
                  opacity: pressed ? 0.5 : 1,
                }}
              />
            );
          }}
        </Pressable>
      </Link>
      {/* </View> */}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    gap: 5,
  },
  themeIcon: {
    marginRight: 3,
  },
});
