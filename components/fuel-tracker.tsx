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
import { useObject, useQuery, useRealm } from '@realm/react';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from "uuid";
import { AppState, LocationPoint, Trip, updateTripDistance } from '@/models/models';

const ACCURACY = LocationAccuracy.BestForNavigation;
const TIME_INTERVAL = 1000;
const DISTANCE_INTERVAL = 1;

const FuelTracker = () => {
  const [fuelSpent, setFuelSpent] = useState(0);
  const [startPosition, setStartPosition] = useState<LocationObject | null>(null);
  const [gpsStatus, setGpsStatus] = useState<'idle' | 'acquiring' | 'active' | 'error'>('idle');

  const watchIdRef = useRef<LocationSubscription | null>(null);

  const [tripId, setTripId] = useState<string>("");
  const realm = useRealm(); 
  const trip = useObject(Trip, tripId);
  const appState = useQuery(AppState)[0];
  const { isTracking, consumptionRate } = appState;
  const setIsTracking = useCallback((newState: boolean) => {
    realm.write(() => {
      appState.isTracking = newState;
    })
  }, []);
  const setConsumptionRate = useCallback((newRate: string) => {
    realm.write(() => {
      appState.consumptionRate = newRate;
    })
  }, []);
  const duration = trip?.duration || 0;
  const points = trip?.points || Array<LocationPoint>();

  const currentPosition = {
    coords: (points && points.length && points.length > 0) ? {
      latitude: points?.at(points.length - 1)!.latitude,
      longitude: points?.at(points.length - 1)!.longitude
    } : {
      latitude: 0,
      longitude: 0
    }
  };
  const distance = trip?.distance || 0

  const addTrip = useCallback(() => {
    const uuid = uuidv4()
    realm.write(() => { 
      realm.create("Trip", { 
        id: uuid, 
        date: new Date(), 
        duration: 0, 
        distance: 0, 
        points: [], 
      }); 

      appState.lastTripId = uuid;
    });
    
    return uuid;
  }, []);

  // Calculate fuel spent based on distance and consumption rate
  useEffect(() => {
    const rate = parseFloat(consumptionRate) || 0;
    const spent = (rate * distance) / 100;
    setFuelSpent(spent);
  }, [distance, consumptionRate]);

  // Start watching position
  const startWatch = useCallback(async () =>{
    if (!trip) {
      console.log("trip is null");
      return;
    }

    watchIdRef.current = await watchPositionAsync(
      {
        accuracy: ACCURACY,
        timeInterval: TIME_INTERVAL,
        distanceInterval: DISTANCE_INTERVAL,
      },
      (pos) => {
        realm.write(() => { 
          const point: LocationPoint = realm.create(LocationPoint, {
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            speed: pos.coords.speed ?? 0,
            timestamp: new Date(pos.timestamp),
            accuracy: pos.coords.accuracy ?? 0,
          });

          trip.points.push(point);
          
          updateTripDistance(trip);
        });

        /* console.log(`time:${pos.timestamp - startTime},`, {
            acc: (pos.coords.accuracy || DISTANCE_INTERVAL).toFixed(5),
            lat: pos.coords.latitude,
            lon: pos.coords.longitude,
            speed: pos.coords.speed?.toFixed(5),
          }); */
      },
      (error) => {
        console.error('GPS error:', error);
        setGpsStatus('error');
      }
    );
  }, [trip]);

  useEffect(() => {
    if (!isTracking) return;

    realm.write(() => {
      appState.lastTripId = tripId;
    });
    startWatch();
  }, [isTracking]);

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
      (startPosition) => {
        setGpsStatus('active');
        const tripId = addTrip();
        setTripId(() => tripId);
        setIsTracking(true);
        // toast.success("Tracking started from gas station!");
        console.log('Tracking started from gas station!');
      },
      (error) => {
        console.error('GPS error:', error);
        setGpsStatus('error');
        console.log("Could not get your location. Please enable GPS.");
        // toast.error("Could not get your location. Please enable GPS.");
      }
    );
  }, [consumptionRate]);

  const stopTracking = useCallback(() => {
    console.log(watchIdRef.current);
    if (watchIdRef.current !== null) {
      watchIdRef.current.remove();
      watchIdRef.current = null;
    }

    setTripId(() => "");

    // resetFilters();
    // shareLogFile();

    setIsTracking(false);
    setGpsStatus('idle');
    // toast.info("Tracking stopped");
    console.log("Tracking stopped")
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
        {isTracking && currentPosition.coords && (
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
