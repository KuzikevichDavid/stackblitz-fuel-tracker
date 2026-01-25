import React from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Link, Tabs } from 'expo-router';
import { Pressable } from 'react-native';
import { useColorScheme } from 'nativewind';
import { NAV_THEME } from '@/lib/theme';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Fuel, MoonStarIcon, SunIcon } from 'lucide-react-native';

const SCREEN_OPTIONS = {
  title: 'FUEL TRACKER',
  headerTransparent: false,
  headerLeft: () => <HeaderIcon />,
  headerRight: () => (
            <>
              <ThemeToggle />
              <Link href="../modal" asChild>
                <Pressable>
                  {({ pressed }) => (
                    <FontAwesome
                      name="map-marker"
                      size={25}
                      // color={NAV_THEME[colorScheme ?? 'light'].colors.text}
                      style={{ marginRight: 15, opacity: pressed ? 0.5 : 1 }}
                    />
                  )}
                </Pressable>
              </Link>
            </>
          ),
};

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
        // headerTitleAlign: 'center',
        /* headerLeft: () => { 
            console.log('header' + colors.text);
          return (<HeaderIcon color={colors.text}/>)
        }, */
        // Disable the static render of the header on web
        // to prevent a hydration error in React Navigation v6.
        // headerShown: useClientOnlyValue(false, true),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Tracker',
          tabBarIcon: ({ color }) => <TabBarIcon name="truck" color={color} />,
          // headerLeft: () => <HeaderIcon color={colors.text}/>,
          headerRight: () => <HeaderRight color={colors.text} />,
        }}
      />
      <Tabs.Screen
        name="map"
        options={{
          title: 'Map',
          tabBarIcon: ({ color }) => <TabBarIcon name="map" color={color} />,
          // headerLeft: () => <HeaderIcon color={colors.text}/>,
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

  return (
    <Button
      onPress={() => toggleColorScheme()}
      size="icon"
      variant="ghost"
      className="ios:size-9 rounded-full web:mx-4">
      <Icon as={THEME_ICONS[colorScheme ?? 'light']} className="size-5" />
    </Button>
  );
}

interface Props {
  color?: string;
}

function HeaderRight({ color } : Props) {
  return (
    <>
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
    </>
  );
}
