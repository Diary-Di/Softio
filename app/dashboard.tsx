import { Ionicons } from '@expo/vector-icons';
import {
  DrawerContentScrollView,
  DrawerItem,
  DrawerItemList,
  createDrawerNavigator,
} from '@react-navigation/drawer';
import { Image, StyleSheet, Text, View } from 'react-native';

// ---------- Écrans ----------
import CustomerStackNavigator from '../navigation/CustomerStackNavigator';
import ProductStackNavigator from '../navigation/ProductStackNavigator';
import HomeScreen from '../screens/HomeScreen';
import ProfileScreen from '../screens/ProfileScreen';
import SaleScreen from '../screens/SaleScreen';

// ---------- Palette ----------
const colors = {
  primary        : '#6366F1',
  surface        : '#FFFFFF',
  text           : '#1E293B',
  textSecondary  : '#64748B',
  border         : '#E2E8F0',
  accent         : '#EC4899',
};

// ---------- Drawer personnalisé ----------
function ModernDrawer(props: any) {
  return (
    <View style={{ flex: 1 }}>
      {/* Header */}
      <View style={styles.header}>
        <Image source={{ uri: 'https://i.pravatar.cc/80' }} style={styles.avatar} />
        <Text style={styles.name}>John Doe</Text>
        <Text style={styles.email}>john@example.com</Text>
      </View>

      {/* Liste des liens */}
      <DrawerContentScrollView {...props} scrollEnabled={false} contentContainerStyle={styles.list}>
        <DrawerItemList {...props} />
      </DrawerContentScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <DrawerItem
          label="Déconnexion"
          icon={({ color, size }) => <Ionicons name="log-out-outline" color={color} size={size} />}
          onPress={() => {}} // branche ta logique ici
          labelStyle={styles.logoutLabel}
          inactiveTintColor={colors.textSecondary}
          activeTintColor={colors.accent}
        />
      </View>
    </View>
  );
}

// ---------- Navigator ----------
const Drawer = createDrawerNavigator();

export default function Dashboard() {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <ModernDrawer {...props} />}
      screenOptions={{
        headerShown        : true,
        drawerType         : 'slide',
        drawerStyle        : { width: 280, backgroundColor: colors.surface },
        overlayColor       : 'rgba(0,0,0,0.3)',

        // Item styling
        drawerActiveTintColor   : '#fff',
        drawerInactiveTintColor : colors.textSecondary,
        drawerActiveBackgroundColor : colors.primary,
        drawerLabelStyle     : { fontSize: 16, fontWeight: '600', marginLeft: 12 }, // ⬅️ ESPACEMENT
        drawerItemStyle      : {
          borderRadius    : 12,
          marginHorizontal: 12,
          marginVertical  : 4,
          paddingVertical : 4,
        },

        // Header
        headerTintColor  : colors.primary,
        headerTitleStyle : { fontWeight: '700', fontSize: 20, color: colors.text },
      }}
    >
      <Drawer.Screen
        name="Accueil"
        component={HomeScreen}
        options={{
          drawerIcon: ({ color, size }) => <Ionicons name="home-outline" size={size} color={color} />,
        }}
      />
      <Drawer.Screen
        name="Clients"
        component={CustomerStackNavigator}
        options={{
          drawerIcon: ({ color, size }) => <Ionicons name="people-outline" size={size} color={color} />,
        }}
      />



      <Drawer.Screen
        name="Produits"
        component={ProductStackNavigator}  // ← Utilisez le Stack Navigator ici
        options={{
          drawerIcon: ({ color, size }) => <Ionicons name="cube-outline" size={size} color={color} />,
        }}
      />
      <Drawer.Screen
        name="Ventes"
        component={SaleScreen}
        options={{
          drawerIcon: ({ color, size }) => <Ionicons name="cart-outline" size={size} color={color} />,
        }}
      />
      <Drawer.Screen
        name="Profil"
        component={ProfileScreen}
        options={{
          drawerIcon: ({ color, size }) => <Ionicons name="person-circle-outline" size={size} color={color} />,
        }}
      />
    </Drawer.Navigator>
  );
}

// ---------- Styles ----------
const styles = StyleSheet.create({
  header: {
    paddingTop       : 60,
    paddingBottom    : 24,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderColor      : colors.border,
    backgroundColor  : colors.surface,
  },
  avatar: {
    width       : 56,
    height      : 56,
    borderRadius: 28,
    marginBottom: 12,
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
  list: { paddingTop: 12 },
  footer: {
    borderTopWidth: 1,
    borderColor   : colors.border,
    paddingBottom : 24,
  },
  logoutLabel: { fontSize: 16, fontWeight: '600', marginLeft: 12 },
});