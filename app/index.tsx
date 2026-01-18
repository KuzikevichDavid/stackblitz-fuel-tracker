import FuelTracker from '@/components/fuel-tracker';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Trip, LocationPoint } from '@/models/models';
import { RealmProvider } from "@realm/react";
import { Link, Stack } from 'expo-router';
import { Fuel, MoonStarIcon, StarIcon, SunIcon } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import * as React from 'react';
import { Image, type ImageStyle, View } from 'react-native';
import Animated from 'react-native-reanimated';

const LOGO = {
  light: require('@/assets/images/react-native-reusables-light.png'),
  dark: require('@/assets/images/react-native-reusables-dark.png'),
};

const SCREEN_OPTIONS = {
  title: 'FUEL TRACKER',
  headerTransparent: false,
  headerLeft: () => <HeaderIcon />,
  headerRight: () => <ThemeToggle />,
};

const IMAGE_STYLE: ImageStyle = {
  height: 76,
  width: 76,
};

export default function Screen() {
  return (
    <>
      <Stack.Screen options={SCREEN_OPTIONS} />
      <Animated.ScrollView scrollEventThrottle={16}>
        <RealmProvider schema={[Trip, LocationPoint]} >
          <FuelTracker />
        </RealmProvider>
      </Animated.ScrollView>
    </>
  );
}

const THEME_ICONS = {
  light: SunIcon,
  dark: MoonStarIcon,
};

function HeaderIcon() {
  return (
    <>
      <Fuel className="h-8 w-8 text-primary" />
    </>
  );
}

function ThemeToggle() {
  const { colorScheme, toggleColorScheme } = useColorScheme();

  return (
    <Button
      onPressIn={toggleColorScheme}
      size="icon"
      variant="ghost"
      className="ios:size-9 rounded-full web:mx-4">
      <Icon as={THEME_ICONS[colorScheme ?? 'light']} className="size-5" />
    </Button>
  );
}
