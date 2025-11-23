import React from 'react';
import {
  DrawerContentScrollView,
  DrawerItemList,
  DrawerItem,
} from '@react-navigation/drawer';
import { View, Text, Image, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const colors = {
  primary     : '#6366F1',
  surface     : '#FFFFFF',
  text        : '#1E293B',
  textSecondary:'#64748B',
  border      : '#E2E8F0',
  accent      : '#EC4899',
};

export default function ModernDrawer(props: any) {
  return (
    <View style={{ flex: 1 }}>
      {/* ---- User header ---- */}
      <View style={styles.header}>
        <Image
          source={{ uri: 'https://i.pravatar.cc/80' }}
          style={styles.avatar}
        />
        <Text style={styles.name}>John Doe</Text>
        <Text style={styles.email}>john@example.com</Text>
      </View>

      {/* ---- Navigation ---- */}
      <DrawerContentScrollView
        {...props}
        scrollEnabled={false}
        contentContainerStyle={styles.list}
      >
        <DrawerItemList {...props} />
      </DrawerContentScrollView>

      {/* ---- Footer ---- */}
      <View style={styles.footer}>
        <DrawerItem
          label="Déconnexion"
          icon={({ color, size }) => (
            <Ionicons name="log-out-outline" color={color} size={size} />
          )}
          onPress={() => {}}
          labelStyle={styles.logoutLabel}
          activeTintColor={colors.accent}
          inactiveTintColor={colors.textSecondary}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop   : 60,
    paddingBottom: 24,
    paddingHorizontal: 24,
    borderBottomWidth : 1,
    borderColor : colors.border,
    backgroundColor: colors.surface,
  },
  avatar: {
    width        : 56,
    height       : 56,
    borderRadius : 28,
    marginBottom : 12,
  },
  name: {
    fontSize : 18,
    fontWeight:'600',
    color    : colors.text,
  },
  email: {
    fontSize : 14,
    color    : colors.textSecondary,
    marginTop: 2,
  },
  list: {
    paddingTop: 12,
  },
  footer: {
    borderTopWidth: 1,
    borderColor   : colors.border,
    paddingBottom: 24,
  },
  logoutLabel: {
    fontSize  : 16,
    fontWeight:'600',
    marginLeft:-16,
  },
});