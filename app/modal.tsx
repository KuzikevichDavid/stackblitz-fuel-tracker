import { Text } from '@/components/ui/text';
import { NAV_THEME } from '@/lib/theme';
import { AppState, Trip } from '@/models/models';
import { useQuery, useRealm } from '@realm/react';
import { Link, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Fuel, MapPinned, Trash2 } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import { FlatList, Platform, Pressable, StyleSheet, View } from 'react-native';

export default function ModalScreen() {
  const realm = useRealm();
  const trips = useQuery(Trip);
  const state = useQuery(AppState)[0];
  const { colorScheme } = useColorScheme();
  const {colors} = NAV_THEME[colorScheme ?? 'light'];

  return (
    <>
      {/* <Stack.Screen options={{ headerLeft: () => <Fuel className="h-8 w-8" color={colors.text}/>, }} /> */}
      <View style={styles.container}>
        <Text style={styles.title}>Modal</Text>
        <View style={styles.separator} /* lightColor="#eee" darkColor="rgba(255,255,255,0.1)" */ />
        {/* <SafeAreaView> */}
          <FlatList
            data={trips.sorted("date")}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={{ flexDirection: "row", margin: 10 }}>
                <Text>{`Trip: ${item.date.toLocaleString(undefined, {formatMatcher: 'best fit'})}; km:${item.distance}; points:${item.points.length}`}</Text>
                <Link href="/(tabs)/map" asChild>
                  <Pressable>
                    {({ pressed }) => {
                      if (pressed) {
                        realm.write(() => { state.lastTripId = item.id});
                      }

                      return (<><MapPinned title='show' color={colors.text} /* size={15} *//></>);
                    }} 
                  </Pressable>
                </Link>
                <Pressable onPress={() => realm.write(() => { realm.delete(item) })}>
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
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
});
