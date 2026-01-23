import Realm from "realm";

export class LocationPoint extends Realm.Object<LocationPoint> {
  latitude!: number;
  longitude!: number;
  speed?: number;
  timestamp!: Date;
  accuracy?: number;

  static schema: Realm.ObjectSchema = {
    name: "LocationPoint",
    properties: {
      latitude: "double",
      longitude: "double",
      speed: "double?",
      timestamp: "date",
      accuracy: "double?",
    },
  };
}

export class Trip extends Realm.Object<Trip> {
  id!: string;
  date!: Date;
  duration?: number;
  distance?: number;
  points!: Realm.List<LocationPoint>;

  static schema: Realm.ObjectSchema = {
    name: "Trip",
    primaryKey: "id",
    properties: {
      id: "string",
      date: "date",
      duration: "int?",
      distance: "double?",
      points: { type: "list", objectType: "LocationPoint" },
    },
  };
}

// translate Deg to Rads
function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

// Haversine formula to calculate distance between two GPS coordinates
export function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth's radius in meters
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // meters
}

export function updateTripDistance(trip: Trip): void {
  let total = trip.distance || 0;
  for (let i = trip.points.length - 2; i < trip.points.length - 2 && i >= 0; i++) {
    console.log(`i=${i} i+1=${i+1} len=${trip.points.length}`);
    
    const p1 = trip.points[i + 1];
    const p2 = trip.points[i];
    console.log(p1);
    console.log(p2);
    
    total += haversineDistance(
      p1.latitude,
      p1.longitude,
      p2.latitude,
      p2.longitude
    );

    trip.duration = Math.round(
      (trip.points[i + 1].timestamp.getTime() -
        trip.points[0].timestamp.getTime()) /
      1000); // seonds
  }

  trip.distance = total / 1000; // kilometers
}

export class AppState extends Realm.Object<AppState> {
  _id!: Realm.BSON.ObjectId;
  theme!: "light" | "dark";
  lastTripId?: string;
  // isLoggedIn!: boolean;

  static schema: Realm.ObjectSchema = {
    name: "AppState",
    primaryKey: "_id",
    properties: {
      _id: "objectId",
      theme: "string",
      lastTripId: "string?",
      // isLoggedIn: "bool",
    },
  };
}
