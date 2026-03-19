import { Text } from '@/components/ui/text';
import { AppState } from '@/models/models';
import { useQuery, useRealm } from '@realm/react';
import { useCallback } from 'react';
import { TextInput, View } from 'react-native';

export default function ConsumptionRateInput() {
  const realm = useRealm();
  const appState = useQuery(AppState)[0];
  const { isTracking, consumptionRate } = appState;

  const setConsumptionRate = useCallback(
    (newRate: string) => {
      realm.write(() => {
        appState.consumptionRate = newRate;
      });
    },
    [realm, appState]
  );

  return (
    <View className="dashboard-card mb-4 gap-3 p-5 text-center text-sm font-medium">
      <Text className="mb-2 block text-center text-sm font-medium text-muted-foreground">
        Consumption Rate (L/100km)
      </Text>
      <View className="relative">
        <TextInput
          inputMode="decimal"
          keyboardType="numeric"
          maxLength={5}
          // step="0.1"
          // min="0"
          value={consumptionRate}
          onChangeText={setConsumptionRate}
          editable={!isTracking}
          className="h-14 w-full rounded-lg border border-border bg-muted px-4 font-display text-xl text-foreground focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-50"
          placeholder="8.5"
        />
        <Text className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
          L/100km
        </Text>
      </View>
    </View>
  );
}
