import FuelTracker from '@/components/fuel-tracker';
import Animated from 'react-native-reanimated';

export default function TabOneScreen() {
  return (
    <>
      <Animated.ScrollView scrollEventThrottle={16}>
        <FuelTracker />
      </Animated.ScrollView>
    </>
  );
}
