import { Text } from '@/components/ui/text';
import { NAV_THEME } from '@/lib/theme';
import { AppState, Trip } from '@/models/models';
import { Theme } from '@react-navigation/native';
import { useQuery, useRealm } from '@realm/react';
import { Link } from 'expo-router';
import { MapPinned, Trash2, CircleChevronRight, CircleChevronDown } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import { useState } from 'react';
import { FlatList, Platform, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const SPEED_CONVERT_COEF = 3.6;

const dateFormatter = new Intl.DateTimeFormat('ru-RU', {
  day: '2-digit',
  month: '2-digit',
  year: '2-digit',
});

const timeFormat = (secondsDiff: number) => {
  const minutes = Math.floor(secondsDiff / 60);
  const seconds = secondsDiff % 60;
  return `${minutes}:${seconds < 10 ? '0' + seconds : seconds}`;
};

const numberFormat = (num: number) => {
  return num > 1e3 ? num.toPrecision(3) : num.toFixed(2);
};

const InnerList = ({ item }: { item: Trip }) => {
  return (
    <>
    { /* item.points.map((v, i) => {
      return  (
        <Text key={item.id + i}>
          {' '}
          {`[${i}] - accuracy:${v.accuracy?.toFixed(2)} speed:${((v.speed || 0) * SPEED_CONVERT_COEF).toFixed(2)}`}{' '}
        </Text>
      )
    })  */}
    
    {<FlatList
      nestedScrollEnabled={true}
      data={item.points}
      keyExtractor={(_, i) => item.id + i}
      renderItem={({ item: v, index: i }) => (
        <Text>
          {' '}
          {`${i} - a:${v.accuracy?.toFixed(2)} s:${((v.speed || 0) * SPEED_CONVERT_COEF).toFixed(2)}`}{' '}
        </Text>
      )}
    />}
    </>
  );
};

export default function TabThreeScreen() {
  const insets = useSafeAreaInsets();
  const realm = useRealm();
  const trips = useQuery(Trip);
  const [expandedTrip, setExpandedTrip] = useState<[string, boolean]>(['', false]);
  const state = useQuery(AppState)[0];
  const { colorScheme } = useColorScheme();
  const theme = NAV_THEME[colorScheme ?? 'light'];
  const { colors } = theme;
  const styles = getStyles(theme);

  return (
    <View
      style={{
        paddingBottom: insets.bottom,
        ...styles.container,
      }}>
      <Text style={styles.title}>Trip history</Text>
      <FlatList
        style={{width: '100%'}}
        data={trips.sorted('date', true)}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View
            style={{
              borderBlockColor: colors.border,
              ...styles.listRow,
              ...styles.container,
              flexDirection: 'column',
              alignContent: 'center',
              marginRight: insets.right,
              marginLeft: insets.left,
              width: '97%',
            }}>
            <View style={{ ...styles.listRow, ...styles.container }}>
              <Pressable
                onPress={({}) => {
                  if (expandedTrip[0] !== item.id) {
                    console.log(`in true`);

                    setExpandedTrip([item.id, true]);
                  } else if (expandedTrip[1]) {
                    console.log('in false');

                    setExpandedTrip([item.id, false]);
                  }
                }}>
                {expandedTrip[0] === item.id && expandedTrip[1] ? (
                  <CircleChevronDown color={colors.text} />
                ) : (
                  <CircleChevronRight color={colors.text} />
                )}
              </Pressable>
              <Text
                textBreakStrategy="simple"
                style={{ flexDirection: 'row', flex: 1, flexShrink: 1 }}>
                {`${dateFormatter.format(item.date)} - ${timeFormat(item.duration ?? 0)};  km:${numberFormat(item.distance ?? 0)}; points:${numberFormat(item.points.length)}`}
              </Text>
              <Pressable
                style={{ borderBlockColor: colors.border }}
                onPress={() =>
                  realm.write(() => {
                    realm.delete(item);
                  })
                }>
                <Trash2 title="delete" color={colors.text} />
              </Pressable>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                }}>
                <Link href="/(tabs)/map" asChild>
                  <Pressable
                    onPressIn={() => {
                      realm.write(() => {
                        state.lastTripId = item.id;
                      });
                    }}>
                    <MapPinned title="show" color={colors.text} />
                  </Pressable>
                </Link>
              </View>
            </View>
            <View>
              {expandedTrip[0] === item.id && expandedTrip[1] && <InnerList item={item} />}
            </View>
          </View>
        )}
      />
    </View>
  );
}

const getStyles = ({ colors }: Theme) =>
  StyleSheet.create({
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
      flexDirection: 'row',
      margin: 10,
      gap: 5,
      borderColor: colors.border,
      borderWidth: 1,
    },
    separator: {
      marginVertical: 30,
      height: 1,
      width: '80%',
    },
  });
