import { Text } from '@/components/ui/text';
import { AppState, Trip } from "@/models/models";
import { useObject, useQuery } from "@realm/react";
import React, { useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";
// import MapView, { LatLng, Marker, Polyline, Region } from "react-native-maps";
import { LatLngLiteral, LeafletMap, Marker, Polyline } from 'react-native-leaflet-plus';

export default function LocationMap() {
  const { lastTripId: tripId } = useQuery(AppState)[0];

  if (!tripId) return null;
  
  const trip = useObject(Trip, tripId);
  // const [region, setRegion] = useState<Region | null>(null);
  const [routeCoords, setRouteCoords] = useState<LatLngLiteral[]>([]);

  useEffect(() => {
    if (!(trip?.points) || trip?.points.length === 0) return;

    // setRegion(() => {
    //   return {
    //     latitude: trip.points[trip.points.length - 1].latitude,
    //     longitude: trip.points[trip.points.length - 1].longitude,
    //     latitudeDelta: 0.01,
    //     longitudeDelta: 0.01,
    //   }
    // });
    setRouteCoords((prev) => {
      /* if (trip.points.length > prev.length){
        const add = trip.points.slice(trip.points.length - prev.length);
        prev.push(...(add.map((v) => { return { lat: v.latitude, lng: v.longitude }})));
      } 
      return prev; */
      return trip.points.map((v) => { return { lat: v.latitude, lng: v.longitude }});
    });
  }, [trip]);

  // if (!region) return null;
  if (routeCoords.length === 0) return <Text style={styles.container}>Trip is empty</Text>;

  return (
    <View style={styles.container}>
      {/* <MapView style={styles.map} region={region} googleMapId="">
        {routeCoords.length > 0 && (
          <>
            <Polyline coordinates={routeCoords} strokeWidth={4} strokeColor="#007AFF" />
            <Marker coordinate={routeCoords[routeCoords.length - 1]} title="You" />
          </>
        )} 
      </MapView> */}
      <LeafletMap
        style={styles.map}
        options={{
          center: routeCoords[routeCoords.length - 1], 
          zoom: 13,
        }}
        tileLayer={{
          url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
          options: {
            attribution: '© OpenStreetMap contributors',
          },
        }}
      >
        <Marker
          uniqueId="marker1"
          latlng={routeCoords[routeCoords.length - 1]}
          options={{
            title: 'You',
          }}
          onPress={() => console.log('Marker pressed!')}
        />

        <Polyline
          uniqueId="route1"
          latlngs={routeCoords}
          options={{
            color: 'blue',
            weight: 3,
          }}
        />
      </LeafletMap>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { 
    flex: 1 ,
  },
});