import 'tsx/cjs'; // Recommended for full TypeScript support in dynamic config
import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => {
  // console.log(config.extra?.eas?.projectId);
  return {
    ...config,
    name: 'fuel-tracker',
    slug: 'my-expo-app',
    version: '1.0.0',
    scheme: 'fueltracker',
    web: {
      favicon: './assets/favicon.png',
    },
    experiments: {
      tsconfigPaths: true,
      typedRoutes: true,
    },
    plugins: [
      'expo-router',
      'expo-background-task',
      '@maplibre/maplibre-react-native',
      [
        'expo-font',
        {
          fonts: ['./assets/fonts/Orbitron-VariableFont_wght.ttf'],
          android: {
            fonts: [
              {
                fontFamily: 'Orbitron',
                fontDefinitions: [
                  {
                    path: './assets/fonts/Orbitron-Regular.ttf',
                    weight: 400,
                  },
                  {
                    path: './assets/fonts/Orbitron-Medium.ttf',
                    weight: 500,
                  },
                  {
                    path: './assets/fonts/Orbitron-SemiBold.ttf',
                    weight: 600,
                  },
                  {
                    path: './assets/fonts/Orbitron-Bold.ttf',
                    weight: 700,
                  },
                  {
                    path: './assets/fonts/Orbitron-ExtraBold.ttf',
                    weight: 800,
                  },
                  {
                    path: './assets/fonts/Orbitron-Black.ttf',
                    weight: 900,
                  },
                ],
              },
            ],
          },
          ios: {
            fonts: ['./assets/fonts/Orbitron-VariableFont_wght.ttf'],
          },
        },
      ],
    ],
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'dark',
    splash: {
      image: './assets/splash.png',
      resizeMode: 'contain',
      backgroundColor: '#ffffff',
    },
    assetBundlePatterns: ['**/*'],
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.crippersworkshop.fueltracker',
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#ffffff',
      },
      package: 'com.crippersworkshop.fueltracker',
      permissions: [
        'SYSTEM_ALERT_WINDOW',
        'VIBRATE',
        'READ_EXTERNAL_STORAGE',
        'WRITE_EXTERNAL_STORAGE',
        'ACCESS_NETWORK_STATE',
        'INTERNET',
        'ACCESS_FINE_LOCATION',
        'ACCESS_COARSE_LOCATION',
        'ACCESS_BACKGROUND_LOCATION',
      ],
    },
    extra: {
      router: {},
      eas: {
        projectId: '61f72798-6e54-4408-8571-384fef3a995a',
      },
    },
  };
};
