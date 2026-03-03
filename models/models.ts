import Realm from 'realm';

export class LocationPoint extends Realm.Object<LocationPoint> {
  latitude!: number;
  longitude!: number;
  speed?: number;
  timestamp!: Date;
  accuracy?: number;

  static schema: Realm.ObjectSchema = {
    name: 'LocationPoint',
    properties: {
      latitude: 'double',
      longitude: 'double',
      speed: 'double?',
      timestamp: 'date',
      accuracy: 'double?',
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
    name: 'Trip',
    primaryKey: 'id',
    properties: {
      id: 'string',
      date: 'date',
      duration: 'int?',
      distance: 'double?',
      points: { type: 'list', objectType: 'LocationPoint' },
    },
  };
}

// translate Deg to Rads
function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

// Haversine formula to calculate distance between two GPS coordinates
export function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // Earth's radius in meters
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // meters
}

export function updateTripDistance(trip: Trip): void {
  let total = trip.distance || 0;

  if (trip.points.length >= 2) {
    const p1 = trip.points[trip.points.length - 1];
    const p2 = trip.points[trip.points.length - 2];
    // console.log(p1);
    // console.log(p2);

    total += haversineDistance(p1.latitude, p1.longitude, p2.latitude, p2.longitude);

    trip.duration = Math.floor(
      (trip.points[trip.points.length - 1].timestamp.getTime() -
        trip.points[0].timestamp.getTime()) /
        1000
    ); // seconds
  }
  trip.distance = (trip.distance ?? 0) + total / 1000; // kilometers

  // console.log(`total:${total}`);
  // console.log(`distance:${trip.distance}`);
  // console.log(`duration:${trip.duration}`);
}

export class AppState extends Realm.Object<AppState> {
  _id!: Realm.BSON.ObjectId;
  theme!: 'light' | 'dark';
  lastTripId?: string;
  isTracking!: boolean;
  consumptionRate!: string;
  gpsStatus!: 'idle' | 'acquiring' | 'active' | 'error' | 'disabled';

  static schema: Realm.ObjectSchema = {
    name: 'AppState',
    primaryKey: '_id',
    properties: {
      _id: 'objectId',
      theme: 'string',
      lastTripId: 'string?',
      isTracking: 'bool',
      consumptionRate: 'string',
      gpsStatus: 'string',
    },
  };
}

export const realmConfig: Realm.Configuration = {
  schema: [Trip, LocationPoint, AppState],
  schemaVersion: 2,
  onMigration: (oldRealm, newRealm) => {
    if (oldRealm.schemaVersion < 1) {
      const oldObjects = oldRealm.objects('AppState');
      const newObjects = newRealm.objects('AppState');

      for (let i = 0; i < oldObjects.length; i++) {
        (newObjects[i] as any).isTracking = false;
        (newObjects[i] as any).consumptionRate = '8.5';
      }
    } else if (oldRealm.schemaVersion < 2) {
      const oldObjects = oldRealm.objects('AppState');
      const newObjects = newRealm.objects('AppState');

      for (let i = 0; i < oldObjects.length; i++) {
        (newObjects[i] as any).isTracking = false;
        (newObjects[i] as any).consumptionRate = '8.5';
      }
    }
  },
  onFirstOpen: (realm: Realm) => {
    realm.create(AppState, {
      _id: new Realm.BSON.ObjectId(),
      theme: 'dark',
      lastTripId: '',
      isTracking: false,
      consumptionRate: '8.5',
      gpsStatus: 'idle',
    });
  },
};

const realm = new Realm(realmConfig);

export default realm;
