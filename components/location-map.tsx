import { AppState, Trip } from "@/models/models";
import { useObject, useQuery } from "@realm/react";
import React, { useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";
import MapView, { LatLng, Marker, Polyline, Region } from "react-native-maps";

export default function LocationMap() {
  const { lastTripId: tripId } = useQuery(AppState)[0];

  if (!tripId) return null;
  
  const trip = useObject(Trip, tripId);
  const [region, setRegion] = useState<Region | null>(null);
  const [routeCoords, setRouteCoords] = useState<LatLng[]>([]);

  useEffect(() => {
    if (!(trip?.points) || trip?.points.length === 0) return;

    setRegion(() => {
      return {
        latitude: trip.points[trip.points.length - 1].latitude,
        longitude: trip.points[trip.points.length - 1].longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }
    });
    setRouteCoords((prev) => {
      if (trip.points.length > prev.length){
        const add = trip.points.slice(trip.points.length - prev.length);
        prev.push(...(add));
      } 
      return prev;
    });
  }, [trip]);

  if (!region) return null;

  return (
    <View style={styles.container}>
      <MapView style={styles.map} region={region} /* googleMapId="" */>
        {routeCoords.length > 0 && (
          <>
            <Polyline coordinates={routeCoords} strokeWidth={4} strokeColor="#007AFF" />
            <Marker coordinate={routeCoords[routeCoords.length - 1]} title="You" />
          </>
        )} 
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { 
    flex: 1 ,
  },
});