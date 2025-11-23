import React from 'react';
import { Animated, View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  visible: Animated.AnimatedAddition<string | number>;
  onTab: (tab: 'produit' | 'prix' | 'categorie') => void;
  active : 'produit' | 'prix' | 'categorie';
}

export default function FloatingBottomBar({ visible, onTab, active }: Props) {
  const translateY = visible.interpolate({
    inputRange : [0, 1],
    outputRange: [80, 0], // 80 = hauteur estimée du bar
  });

  const tabs = [
    { key: 'produit',   icon: 'cube-outline',    label: 'Produits' },
    { key: 'prix',      icon: 'pricetag-outline',label: 'Prix' },
    { key: 'categorie', icon: 'albums-outline',  label: 'Catégories' },
  ] as const;

  return (
    <Animated.View style={[styles.bar, { transform: [{ translateY }] }]}>
      <View style={styles.row}>
        {tabs.map(({ key, icon, label }) => (
          <TouchableOpacity
            key={key}
            style={styles.tab}
            onPress={() => onTab(key)}
          >
            <Ionicons
              name={icon}
              size={22}
              color={active === key ? '#6366F1' : '#64748B'}
            />
            <Text
              style={[
                styles.label,
                { color: active === key ? '#6366F1' : '#64748B' },
              ]}
            >
              {label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  bar: {
    position        : 'absolute',
    bottom          : 24,
    left            : 24,
    right           : 24,
    backgroundColor : '#fff',
    borderRadius    : 16,
    paddingVertical : 10,
    paddingHorizontal: 12,
    shadowColor     : '#000',
    shadowOffset    : { width: 0, height: 4 },
    shadowOpacity   : 0.1,
    shadowRadius    : 8,
    elevation       : 6,
  },
  row: { flexDirection: 'row', justifyContent: 'space-around' },
  tab: { alignItems: 'center', flex: 1 },
  label: { fontSize: 12, marginTop: 2 },
});