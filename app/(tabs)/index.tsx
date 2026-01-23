import FuelTracker from "@/components/fuel-tracker";
import { NAV_THEME } from "@/lib/theme";
import { Stack } from "expo-router";
import { Fuel } from "lucide-react-native";
import { useColorScheme } from "nativewind";
import Animated from "react-native-reanimated";

export default function TabOneScreen() {
  const { colorScheme } = useColorScheme();
  const {colors} = NAV_THEME[colorScheme ?? 'light'];
  
  return (
    <>
      <Stack.Screen options={{ headerLeft: () => <Fuel className="h-8 w-8" color={colors.primary}/>, }} />
      <Animated.ScrollView scrollEventThrottle={16}>
        <FuelTracker />
      </Animated.ScrollView>
    </>
  );
}
