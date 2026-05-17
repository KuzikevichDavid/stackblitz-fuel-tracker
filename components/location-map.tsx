import { Text } from '@/components/ui/text';
import { AppState, Trip } from '@/models/models';
import { useObject, useQuery } from '@realm/react';
import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import {
  Camera,
  MapView,
  ShapeSource,
  LineLayer,
  addCustomHeader,
  MapViewRef,
  Logger,
} from '@maplibre/maplibre-react-native';

export default function LocationMap() {
  const { lastTripId: tripId } = useQuery(AppState)[0];

  const trip = useObject(Trip, tripId);

  const mapViewRef = useRef<MapViewRef | null>(null);

  const [routePoints, setRoutePoints] = useState<GeoJSON.Geometry>();
  const [cameraPositon, setCameraPositon] = useState<GeoJSON.Position>();

  useEffect(() => {
    if (!trip || !trip.points || trip.points.length === 0) return;

    setRoutePoints({
      type: 'MultiPoint',
      coordinates: trip.points
        //.filter((v) => (v.accuracy || 0) <= 10)
        .sorted('timestamp')
        .map((v) => [v.longitude, v.latitude]),
    });

    const lastCoord = trip.points[trip.points.length - 1];

    setCameraPositon([lastCoord.longitude, lastCoord.latitude]);
  }, [trip]);

  useEffect(() => {
    addCustomHeader('User-Agent', 'Fuel-Tracker 1.0 (dotavec@yandex.ru)');
    Logger.setLogLevel('error');
  }, []);

  if (!tripId) return <Text style={styles.container}>There is no trip</Text>;

  if (!trip || trip.points.length === 0) return <Text style={styles.container}>Trip is empty</Text>;

  return (
    <View style={styles.container}>
      <MapView style={styles.map} mapStyle={osmStyle} ref={mapViewRef}>
        <Camera
          centerCoordinate={cameraPositon}
          zoomLevel={17}
          minZoomLevel={13}
          maxZoomLevel={20}
        />
        <ShapeSource id="routeSource" shape={routePoints} />
        <LineLayer
          id="routeLine"
          sourceID="routeSource"
          style={{
            lineColor: '#3498db',
            lineWidth: 4,
            lineCap: 'round',
            lineJoin: 'round',
          }}
        />
      </MapView>
    </View>
  );
}

// Simple OSM Raster Style
const osmStyle = {
  version: 8,
  sources: {
    'osm-tiles': {
      type: 'raster',
      tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
      tileSize: 256,
      attribution: '© OpenStreetMap contributors',
    },
  },
  layers: [
    {
      id: 'osm-layer',
      type: 'raster',
      source: 'osm-tiles',
    },
  ],
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: {
    flex: 1,
  },
});
