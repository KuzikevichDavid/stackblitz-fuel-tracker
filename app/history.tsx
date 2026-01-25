import { Text } from '@/components/ui/text';
import { NAV_THEME } from '@/lib/theme';
import { AppState, Trip } from '@/models/models';
import { useQuery, useRealm } from '@realm/react';
import { Link, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Fuel, MapPinned, Trash2 } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import { FlatList, Platform, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

const dateFormatter = new Intl.DateTimeFormat('ru-RU', {
  day: '2-digit',
  month: '2-digit',
  year: '2-digit',
  // hour: '2-digit',
  // minute: '2-digit'
});

const timeFormat = (secondsDiff: number) => {
  const minutes = Math.floor(secondsDiff / 60); 
  const seconds = secondsDiff % 60;
  return `${minutes}:${seconds}`;
}

export default function HistoryScreen() {
  const insets = useSafeAreaInsets();
  const realm = useRealm();
  const trips = useQuery(Trip);
  const state = useQuery(AppState)[0];
  const { colorScheme } = useColorScheme();
  const {colors} = NAV_THEME[colorScheme ?? 'light'];

  return (
    <>
      <View style={{
        paddingBottom: insets.bottom, 
        ...styles.container
      }}>
        <Text style={styles.title}>Trip history</Text>
        <View style={styles.separator} />
        {/* <SafeAreaView style={{paddingBottom: insets.bottom}}> */}
          <FlatList
            data={trips.sorted("date")}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.listRow}>
                
                <Link href="/(tabs)/map" asChild>
                  <Pressable>
                    {({ pressed }) => {
                      if (pressed) {
                        realm.write(() => { state.lastTripId = item.id});
                      }

                      return (
                        <View style={{borderBlockColor: colors.border, ...styles.listRow}}>
                          <MapPinned title='show' color={colors.text} />
                          <Text>
                            {`Trip: ${dateFormatter.format(item.date)} - ${timeFormat(item.duration ?? 0)};  km:${item.distance?.toFixed(2)}; points:${item.points.length}`}
                          </Text>
                        </View>
                      );
                    }} 
                  </Pressable>
                </Link>
                <Pressable 
                  style={{borderBlockColor: colors.border}} 
                  onPress={() => realm.write(() => { realm.delete(item) })}>
                  <Trash2 title='delete' color={colors.text}/>
                </Pressable>
              </View>
            )}
          />
        {/* </SafeAreaView>     */}
        {/* Use a light status bar on iOS to account for the black space above the modal */}
        <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  listRow: { 
    flexDirection: "row", 
    margin: 10 
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
});
