import React from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Link, Tabs } from 'expo-router';
import { Pressable } from 'react-native';
import { useColorScheme } from 'nativewind';
import { NAV_THEME } from '@/lib/theme';
import { Fuel } from 'lucide-react-native';
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
  const { colorScheme } = scheme;
  const theme = NAV_THEME[colorScheme ?? 'light'];
  const { colors } = theme;
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        headerLeft: () => (
          <Fuel
            className="h-8 w-8"
            color={colors.primary}
            style={{ marginLeft: insets.left + 25 }}
          />
        ),
        headerRight: () => (
          <>
            <Link
              href="../settings"
              asChild
              style={{
                marginRight: insets.right + 25,
              }}>
              <Pressable>
                <FontAwesome name="gear" size={25} color={colors.text} />
              </Pressable>
            </Link>
          </>
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
      <Tabs.Screen
        name="history"
        options={{
          title: 'History',
          tabBarIcon: ({ color }) => <TabBarIcon name="history" color={color} />,
        }}
      />
    </Tabs>
  );
}
