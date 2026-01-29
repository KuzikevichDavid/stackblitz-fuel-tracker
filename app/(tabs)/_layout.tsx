import React from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Link, Tabs } from 'expo-router';
import { Pressable, View, StyleSheet } from 'react-native';
import { useColorScheme } from 'nativewind';
import { NAV_THEME } from '@/lib/theme';
import { Icon } from '@/components/ui/icon';
import { Fuel, MoonStarIcon, SunIcon } from 'lucide-react-native';
import { useQuery, useRealm } from '@realm/react';
import { AppState } from '@/models/models';

// You can explore the built-in icon families and icons on the web at https://icons.expo.fyi/
function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
}) {
  return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
  const { colorScheme } = useColorScheme();
  const {colors} = NAV_THEME[colorScheme ?? 'light'];
  
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Tracker',
          tabBarIcon: ({ color }) => <TabBarIcon name="truck" color={color} />,
          headerRight: () => <HeaderRight color={colors.text} />,
        }}
      />
      <Tabs.Screen
        name="map"
        options={{
          title: 'Map',
          tabBarIcon: ({ color }) => <TabBarIcon name="map" color={color} />,
          headerRight: () => <HeaderRight color={colors.text}/>
        }}
      />
    </Tabs>
  );
}

function HeaderIcon({ color } : Props) {
  return (
    <>
      <Fuel className="h-8 w-8" color={color}/> {{/*  text-primary */}}
    </>
  );
}

const THEME_ICONS = {
  light: SunIcon,
  dark: MoonStarIcon,
};

function ThemeToggle() {
  const { colorScheme, toggleColorScheme } = useColorScheme();
  const realm = useRealm();
  const appState = useQuery(AppState)[0];

  return (
    <Pressable
      onPress={() => {
        toggleColorScheme();

        realm.write(() => {
          appState.theme = colorScheme === 'dark' ? 'light' : 'dark';
        });
      }}
      // size="icon"
      // variant="ghost"
      className="ios:size-9 rounded-full web:mx-4">
      <Icon as={THEME_ICONS[colorScheme ?? 'light']} className="size-5" style={styles.themeIcon} />
    </Pressable>
  );
}

interface Props {
  color?: string;
}

function HeaderRight({ color } : Props) {
  return (
    <>
    {/* <View style={styles.container}> */}
      <ThemeToggle />
      <Link href="../history" asChild>
        <Pressable>
          {({ pressed }) => (
            <FontAwesome
              name="map-marker"
              size={25}
              color={color}
              style={{ marginRight: 15, opacity: pressed ? 0.5 : 1 }}
            />
          )}
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
    gap: 5 },
  themeIcon: {
    marginRight: 3,
 },
});
