import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { getCurrentPositionAsync, LocationAccuracy, LocationSubscription, PermissionStatus, requestForegroundPermissionsAsync, watchPositionAsync } from "expo-location";
import { Fuel, MapPin, Navigation, Play, RotateCcw, Square } from "lucide-react-native";
import { useCallback, useEffect, useRef, useState } from "react";
import { TextInput, View } from "react-native";

interface Position {
  latitude: number;
  longitude: number;
}

const FuelTracker = () => {
  const [consumptionRate, setConsumptionRate] = useState<string>("8.5");
  const [isTracking, setIsTracking] = useState(false);
  const [distance, setDistance] = useState(0);
  const [fuelSpent, setFuelSpent] = useState(0);
  const [startPosition, setStartPosition] = useState <Position | null>(null);
  const [currentPosition, setCurrentPosition] = useState <Position | null>(null);
  const [gpsStatus, setGpsStatus] = useState<"idle" | "acquiring" | "active" | "error">("idle");
  
  const watchIdRef = useRef<LocationSubscription | null>(null);

  // Haversine formula to calculate distance between two GPS coordinates
  const calculateDistance = useCallback((pos1: Position, pos2: Position): number => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (pos2.latitude - pos1.latitude) * (Math.PI / 180);
    const dLon = (pos2.longitude - pos1.longitude) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(pos1.latitude * (Math.PI / 180)) *
        Math.cos(pos2.latitude * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
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
      return;
    }

    const rate = parseFloat(consumptionRate);
    if (isNaN(rate) || rate <= 0) {
      // toast.error("Please enter a valid consumption rate");
      return;
    }

    setGpsStatus("acquiring");
    setDistance(0);
    setFuelSpent(0);

    getCurrentPositionAsync({ accuracy: LocationAccuracy.BestForNavigation })
      .then(
      async (position) => {
        const start: Position = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
        setStartPosition(start);
        setCurrentPosition(start);
        setIsTracking(true);
        setGpsStatus("active");
        // toast.success("Tracking started from gas station!");

        // Start watching position
        // watchPositionAsync({ accuracy: LocationAccuracy.High }, callback)
        watchIdRef.current = await watchPositionAsync(
          { 
            accuracy: LocationAccuracy.BestForNavigation,
            timeInterval: 3000,
            distanceInterval: 5
          },
          (pos) => {
            const current: Position = {
              latitude: pos.coords.latitude,
              longitude: pos.coords.longitude,
            };
            
            // if (currentPosition) {
            // }
            const dist = calculateDistance(currentPosition || start, current);
            setDistance((prev) => prev + dist);

            // if (start) {
            //   const dist = calculateDistance(start, current);
            //   setDistance(dist);
            // } 
            
            setCurrentPosition(current);
          },
          (error) => {
            console.error("GPS error:", error);
            setGpsStatus("error");
          }
        );
      },
      (error) => {
        console.error("GPS error:", error);
        setGpsStatus("error");
        // toast.error("Could not get your location. Please enable GPS.");
      }
    );
  }, [consumptionRate, calculateDistance]);

  const stopTracking = useCallback(() => {
    if (watchIdRef.current !== null) {
      watchIdRef.current.remove()
      watchIdRef.current = null;
    }
    setIsTracking(false);
    setGpsStatus("idle");
    // toast.info("Tracking stopped");
  }, []);

  const resetTracking = useCallback(() => {
    stopTracking();
    setDistance(0);
    setFuelSpent(0);
    setStartPosition(null);
    setCurrentPosition(null);
  }, [stopTracking]);

  return (
    <View className="min-h-screen min-h-[100dvh] flex flex-col p-4 pb-8 max-w-lg mx-auto">
      {/* Header */}
      <View className="text-center py-6">
        {/* <View className="flex items-center justify-center gap-3 mb-2">
          <Fuel className="w-8 h-8 text-primary" />
          <Text className="font-display text-2xl font-bold text-foreground tracking-wide">
            FUEL TRACKER
          </Text>
        </View> */}
        <Text className="text-muted-foreground text-sm text-center">Track your fuel consumption in real-time</Text>
      </View>

      {/* Consumption Rate Input */}
      <View className="dashboard-card p-5 mb-4">
        <Text className="block text-muted-foreground text-sm mb-2 font-medium text-center">
          Consumption Rate (L/100km)
        </Text>
        <View className="relative">
          <TextInput
            // type="number"
            inputMode="decimal"
            keyboardType="numeric"
            // step="0.1"
            // min="0"
            value={consumptionRate}
            onChangeText={setConsumptionRate}
            // onChange={(e) => setConsumptionRate(e.nativeEvent.target)}
            editable={isTracking}
            className="w-full h-14 bg-muted border border-border rounded-lg px-4 text-foreground font-display text-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
            placeholder="8.5"
          />
          <Text className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
            L/100km
          </Text>
        </View>
      </View>

      {/* Main Display */}
      <View className="dashboard-card p-6 mb-4 flex-1 flex flex-col justify-center">
        {/* Fuel Spent Display */}
        <View className="mb-8">
          <View className="flex-row items-center justify-center gap-2 mb-2">
            <Fuel className="w-5 h-5 text-primary" />
            <Text className="text-muted-foreground text-sm font-medium uppercase tracking-wide">
              Fuel Spent
            </Text>
          </View>
          <Text className="digit-display text-6xl font-bold text-primary text-center">
            {fuelSpent.toFixed(2)}
          </Text>
          <Text className="text-muted-foreground text-lg text-center">liters</Text>
        </View>

        {/* Distance Display */}
        <View className="text-center mb-6">
          <View className="flex-row items-center justify-center gap-2 mb-2">
            <Navigation className="w-4 h-4 text-success" />
            <Text className="text-muted-foreground text-sm font-medium uppercase tracking-wide">
              Distance Traveled
            </Text>
          </View>
          <Text className="digit-display text-4xl text-center font-semibold text-success">
            {distance.toFixed(2)}
          </Text>
          <Text className="text-muted-foreground text-center">km</Text>
        </View>

        {/* GPS Status */}
        <View className="flex-row items-center justify-center gap-2">
          <View
            className={`w-2.5 h-2.5 rounded-full ${
              gpsStatus === "active"
                ? "bg-success"
                : gpsStatus === "acquiring"
                ? "bg-primary"
                : gpsStatus === "error"
                ? "bg-destructive"
                : "bg-muted-foreground"
            }`}
          />
          <Text className="text-muted-foreground text-xs uppercase tracking-wider">
            {gpsStatus === "active"
              ? "GPS Active"
              : gpsStatus === "acquiring"
              ? "Acquiring GPS..."
              : gpsStatus === "error"
              ? "GPS Error"
              : "GPS Standby"}
          </Text>
        </View>

        {/* Coordinates Display */}
        {currentPosition && (
          <View className="mt-4 text-center">
            <View className="flex-row items-center justify-center gap-1 text-muted-foreground text-xs">
              <MapPin className="w-3 h-3" />
              <Text>
                {currentPosition.latitude.toFixed(5)}, {currentPosition.longitude.toFixed(5)}
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
            // onClick={startTracking}
            disabled={gpsStatus === "acquiring"}
          >
            <Play className="w-6 h-6" />
            {/* <Text> */}
              {gpsStatus === "acquiring" ? (<Text>ACQUIRING GPS...</Text>) : (<Text>START</Text>)}
            {/* </Text> */}
          </Button>
        ) : (
          <Button
            variant="destructive"
            size="lg"
            className="w-full font-display tracking-wider"
            onPress={stopTracking}
          >
            <Square className="w-6 h-6" />
            <Text>STOP TRACKING</Text>
          </Button>
        )}

        {(distance > 0 || fuelSpent > 0) && !isTracking && (
          <Button
            variant="outline"
            size="lg"
            className="w-full"
            onPress={resetTracking}

          >
            <RotateCcw className="w-5 h-5" />
            <Text>Reset</Text>
          </Button>
        )}
      </View>

      {/* Formula Info */}
      <View className="mt-6">
        <Text className="text-muted-foreground text-xs text-center">
          Formula: (L/100km) × (km traveled / 100) = Fuel spent
        </Text>
      </View>
    </View>
  );
};

export default FuelTracker;
