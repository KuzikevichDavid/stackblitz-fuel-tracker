import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import {
  getCurrentPositionAsync,
  LocationAccuracy,
  LocationSubscription,
  PermissionStatus,
  requestForegroundPermissionsAsync,
  watchPositionAsync,
  LocationObject,
} from 'expo-location';
import { Fuel, MapPin, Navigation, Play, RotateCcw, Square } from 'lucide-react-native';
import { useCallback, useEffect, useRef, useState } from 'react';
import { TextInput, View } from 'react-native';
import { useLocationStore } from '@codewithvincent/react-native-gps-filter';

interface Position {
  latitude: number;
  longitude: number;
}

const ACCURACY = LocationAccuracy.BestForNavigation;
const TIME_INTERVAL = 3000;
const DISTANCE_INTERVAL = 1;

const FuelTracker = () => {
  const [consumptionRate, setConsumptionRate] = useState<string>('8.5');
  const [isTracking, setIsTracking] = useState(false);
  const [fuelSpent, setFuelSpent] = useState(0);
  const [startPosition, setStartPosition] = useState<LocationObject | null>(null);
  const [gpsStatus, setGpsStatus] = useState<'idle' | 'acquiring' | 'active' | 'error'>('idle');

  const watchIdRef = useRef<LocationSubscription | null>(null);

  const {
    filterAndAddLocation,
    routeCoordinates,
    lastAcceptedPredictedLocation: currentPosition,
    resetFilters,
  } = useLocationStore((state) => state);

  const distance = useLocationStore((state) => state.totalDistanceTraveled / 1000);

  // Haversine formula to calculate distance between two GPS coordinates
  const calculateDistance = useCallback((pos1: Position, pos2: Position): number => {
    // translate to Rads
    const toRad = (value: number): number => (value * Math.PI) / 180;
    const R = 6371; // Earth's radius in kilometers
    const dLat = toRad(pos2.latitude - pos1.latitude);
    const dLon = toRad(pos2.longitude - pos1.longitude);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(pos1.latitude)) *
        Math.cos(toRad(pos2.latitude)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // distance in kilometers
  }, []);

  // Calculate fuel spent based on distance and consumption rate
  useEffect(() => {
    const rate = parseFloat(consumptionRate) || 0;
    const spent = (rate * distance) / 100;
    setFuelSpent(spent);
  }, [distance, consumptionRate]);

  const startTracking = useCallback(async () => {
    let { status } = await requestForegroundPermissionsAsync();
    if (status !== PermissionStatus.GRANTED) {
      // toast.error("Geolocation is not supported by your device");
      console.error('Geolocation is not supported by your device');
      return;
    }

    const rate = parseFloat(consumptionRate);
    if (isNaN(rate) || rate <= 0) {
      // toast.error("Please enter a valid consumption rate");
      console.error('Please enter a valid consumption rate');
      return;
    }

    setGpsStatus('acquiring');
    setFuelSpent(0);

    getCurrentPositionAsync({
      accuracy: ACCURACY,
    }).then(
      async (startPosition) => {
        setStartPosition(startPosition);
        setIsTracking(true);
        setGpsStatus('active');
        // toast.success("Tracking started from gas station!");
        console.log('Tracking started from gas station!');

        // Start watching position
        watchIdRef.current = await watchPositionAsync(
          {
            accuracy: ACCURACY,
            // timeInterval: TIME_INTERVAL,
            distanceInterval: DISTANCE_INTERVAL,
          },
          (pos) => {
            const result = filterAndAddLocation({
              coords: {
                accuracy: pos.coords.accuracy || DISTANCE_INTERVAL,
                latitude: pos.coords.latitude,
                longitude: pos.coords.longitude,
                speed: pos.coords.speed,
              },
              timestamp: pos.timestamp,
            });
            console.log(
              `res:${result.result} pos:${pos.timestamp}  | dist:${((result.distanceTraveled || 0) / 1000).toFixed(5)} | accuracy:${pos.coords.accuracy || DISTANCE_INTERVAL}`
            );
          },
          (error) => {
            console.error('GPS error:', error);
            setGpsStatus('error');
          }
        );
      },
      (error) => {
        console.error('GPS error:', error);
        setGpsStatus('error');
        // toast.error("Could not get your location. Please enable GPS.");
      }
    );
  }, [consumptionRate, calculateDistance]);

  const stopTracking = useCallback(() => {
    console.log(watchIdRef.current);
    if (watchIdRef.current !== null) {
      watchIdRef.current.remove();
      watchIdRef.current = null;
    }

    resetFilters();

    setIsTracking(false);
    setGpsStatus('idle');
    // toast.info("Tracking stopped");
  }, []);

  const resetTracking = useCallback(() => {
    stopTracking();
    setFuelSpent(0);
    setStartPosition(null);
  }, [stopTracking]);

  return (
    <View className="mx-auto flex min-h-[100dvh] min-h-screen max-w-lg flex-col p-4 pb-8">
      {/* Header */}
      <View className="py-6 text-center">
        {/* <View className="flex items-center justify-center gap-3 mb-2">
          <Fuel className="w-8 h-8 text-primary" />
          <Text className="font-display text-2xl font-bold text-foreground tracking-wide">
            FUEL TRACKER
          </Text>
        </View> */}
        <Text className="text-center text-sm text-muted-foreground">
          Track your fuel consumption in real-time
        </Text>
      </View>

      {/* Consumption Rate Input */}
      <View className="dashboard-card mb-4 p-5">
        <Text className="mb-2 block text-center text-sm font-medium text-muted-foreground">
          Consumption Rate (L/100km)
        </Text>
        <View className="relative">
          <TextInput
            inputMode="decimal"
            keyboardType="numeric"
            // step="0.1"
            // min="0"
            value={consumptionRate}
            onChangeText={setConsumptionRate}
            editable={!isTracking}
            className="h-14 w-full rounded-lg border border-border bg-muted px-4 font-display text-xl text-foreground focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-50"
            placeholder="8.5"
          />
          <Text className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
            L/100km
          </Text>
        </View>
      </View>

      {/* Main Display */}
      <View className="dashboard-card mb-4 flex flex-1 flex-col justify-center p-6">
        {/* Fuel Spent Display */}
        <View className="mb-8">
          <View className="mb-2 flex-row items-center justify-center gap-2">
            <Fuel className="h-5 w-5 text-primary" />
            <Text className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
              Fuel Spent
            </Text>
          </View>
          <Text className="digit-display text-center text-6xl font-bold text-primary">
            {fuelSpent.toFixed(2)}
          </Text>
          <Text className="text-center text-lg text-muted-foreground">liters</Text>
        </View>

        {/* Distance Display */}
        <View className="mb-6 text-center">
          <View className="mb-2 flex-row items-center justify-center gap-2">
            <Navigation className="h-4 w-4 text-success" />
            <Text className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
              Distance Traveled
            </Text>
          </View>
          <Text className="digit-display text-center text-4xl font-semibold text-success">
            {distance.toFixed(2)}
          </Text>
          <Text className="text-center text-muted-foreground">km</Text>
        </View>

        {/* GPS Status */}
        <View className="flex-row items-center justify-center gap-2">
          <View
            className={`h-2.5 w-2.5 rounded-full ${
              gpsStatus === 'active'
                ? 'bg-success'
                : gpsStatus === 'acquiring'
                  ? 'bg-primary'
                  : gpsStatus === 'error'
                    ? 'bg-destructive'
                    : 'bg-muted-foreground'
            }`}
          />
          <Text className="text-xs uppercase tracking-wider text-muted-foreground">
            {gpsStatus === 'active'
              ? 'GPS Active'
              : gpsStatus === 'acquiring'
                ? 'Acquiring GPS...'
                : gpsStatus === 'error'
                  ? 'GPS Error'
                  : 'GPS Standby'}
          </Text>
        </View>

        {/* Coordinates Display */}
        {currentPosition && (
          <View className="mt-4 text-center">
            <View className="flex-row items-center justify-center gap-1 text-xs text-muted-foreground">
              <MapPin className="h-3 w-3" />
              <Text>
                {currentPosition.coords.latitude.toFixed(5)},{' '}
                {currentPosition.coords.longitude.toFixed(5)}
              </Text>
            </View>
          </View>
        )}
      </View>

      {/* Control Buttons */}
      <View className="space-y-3">
        {!isTracking ? (
          <Button
            variant="default"
            size="lg"
            className="w-full"
            onPress={startTracking}
            disabled={gpsStatus === 'acquiring'}>
            <Play className="h-6 w-6" />
            <Text>{gpsStatus === 'acquiring' ? 'ACQUIRING GPS...' : 'START'}</Text>
          </Button>
        ) : (
          <Button
            variant="destructive"
            size="lg"
            className="w-full font-display tracking-wider"
            onPress={stopTracking}>
            <Square className="h-6 w-6" />
            <Text>STOP TRACKING</Text>
          </Button>
        )}

        {(distance > 0 || fuelSpent > 0) && !isTracking && (
          <Button variant="outline" size="lg" className="w-full" onPress={resetTracking}>
            <RotateCcw className="h-5 w-5" />
            <Text>Reset</Text>
          </Button>
        )}
      </View>

      {/* Formula Info */}
      <View className="mt-6">
        <Text className="text-center text-xs text-muted-foreground">
          Formula: (L/100km) × (km traveled / 100) = Fuel spent
        </Text>
      </View>
    </View>
  );
};

export default FuelTracker;
