import { Text } from '@/components/ui/text';
import { AppState, Trip } from '@/models/models';
import { useObject, useQuery } from '@realm/react';
import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { LatLngLiteral, LeafletMap, Marker, Polyline } from 'react-native-leaflet-plus';

export default function LocationMap() {
  const { lastTripId: tripId } = useQuery(AppState)[0];

  const trip = useObject(Trip, tripId);
  const [routeCoords, setRouteCoords] = useState<LatLngLiteral[]>([]);

  useEffect(() => {
    if (!trip?.points || trip?.points.length === 0) return;

    setRouteCoords((prev) => {
      return trip.points.map((v) => {
        return { lat: v.latitude, lng: v.longitude };
      });
    });
  }, [trip]);

  if (!tripId) return null;

  if (routeCoords.length === 0) return <Text style={styles.container}>Trip is empty</Text>;

  return (
    <View style={styles.container}>
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
        }}>
        <Marker
          uniqueId="marker1"
          latlng={routeCoords[routeCoords.length - 1]}
          options={{
            title: 'You',
            icon: {
              icon: {
                iconUrl:
                  'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLW1hcC1waW4taWNvbiBsdWNpZGUtbWFwLXBpbiI+PHBhdGggZD0iTTIwIDEwYzAgNC45OTMtNS41MzkgMTAuMTkzLTcuMzk5IDExLjc5OWExIDEgMCAwIDEtMS4yMDIgMEM5LjUzOSAyMC4xOTMgNCAxNC45OTMgNCAxMGE4IDggMCAwIDEgMTYgMCIvPjxjaXJjbGUgY3g9IjEyIiBjeT0iMTAiIHI9IjMiLz48L3N2Zz4=',
                iconSize: [20, 20],
              },
            },
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
    flex: 1,
  },
});
