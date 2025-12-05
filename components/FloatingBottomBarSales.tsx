import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SalesStackParamList } from '../navigation/SalesStackNavigator';

type NavProp = NativeStackNavigationProp<SalesStackParamList>;
type Tab = 'ventes' | 'proforma' | 'newSale'; // Ajouter 'newSale'

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

interface Props {
  active?: Tab;
}

export default function FloatingBottomBarSales({ active = 'ventes' }: Props) {
  const nav = useNavigation<NavProp>();

  const navigateTo = (key: Tab) => {
    switch (key) {
      case 'ventes':
        nav.navigate('SalesList');
        break;
      case 'proforma':
        nav.navigate('proforma');
        break;
      case 'newSale':
        nav.navigate('NewSales'); // Utiliser 'NewSales' qui est défini dans param list
        break;
    }
  };

  const tabs: { key: Tab; icon: IoniconsName; label: string }[] = [
    { key: 'ventes', icon: 'cart-outline', label: 'Vente' },
    { key: 'proforma', icon: 'paper-plane-outline', label: 'Proforma' },
    // Ajouter un onglet pour NewSales si nécessaire
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
            <Ionicons 
              name={icon} 
              size={20} 
              color={active === key ? '#6366F1' : '#64748B'} 
            />
            <Text style={[
              styles.label, 
              { color: active === key ? '#6366F1' : '#64748B' }
            ]}>
              {label}
            </Text>
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
