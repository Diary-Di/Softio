import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { CustomerStackParamList } from '../navigation/CustomerStackNavigator';

type NavProp = NativeStackNavigationProp<CustomerStackParamList>;
type Tab = 'client' | 'suivi';

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

interface Props {
  active?: Tab;
}

export default function FloatingBottomBarCustomer({ active = 'client' }: Props) {
  const nav = useNavigation<NavProp>();

  const navigateTo = (key: Tab) => {
    if (key === 'client') nav.navigate('CustomerList');
    else if (key === 'suivi') nav.navigate('CustomerFollowUp');
  };

  const tabs: { key: Tab; icon: IoniconsName; label: string }[] = [
    { key: 'client', icon: 'people-outline', label: 'Client' },
    { key: 'suivi',  icon: 'time-outline',   label: 'Suivi' },
  ];

  return (
    <View style={styles.bar} pointerEvents="box-none">
      <View style={styles.row}>
        {tabs.map(({ key, icon, label }) => (
          <TouchableOpacity
            key={key}
            style={styles.tab}
            onPress={() => navigateTo(key)}
            accessibilityRole="button"
          >
            <Ionicons name={icon} size={20} color={active === key ? '#6366F1' : '#64748B'} />
            <Text style={[styles.label, { color: active === key ? '#6366F1' : '#64748B' }]}>{label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    position: 'absolute',
    bottom: 24,
    left: 24,
    right: 24,
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 6,
  },
  row: { flexDirection: 'row', justifyContent: 'space-around' },
  tab: { alignItems: 'center', flex: 1 },
  label: { fontSize: 12, marginTop: 2 },
});
