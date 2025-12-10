import { Ionicons } from '@expo/vector-icons';
import {
  DrawerContentScrollView,
  DrawerItem,
  DrawerItemList,
  createDrawerNavigator,
} from '@react-navigation/drawer';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../hooks/useAuth';

// ---------- Écrans ----------
import CustomerStackNavigator from '../navigation/CustomerStackNavigator';
import ProductStackNavigator from '../navigation/ProductStackNavigator';
import SalesStackNavigator from '../navigation/SalesStackNavigator';
import SecurityStackNavigator from '../navigation/SecurityStackNavigator';
import HomeScreen from '../screens/HomeScreen';
import ProfileScreen from '../screens/ProfileScreen';
import ProformaScreen from '../screens/ProformaScreen';
import CreateCompanyScreen from '../screens/CreateCompanyScreen';


// ---------- Palette ----------
const colors = {
  primary: '#6366F1',
  surface: '#FFFFFF',
  text: '#1E293B',
  textSecondary: '#64748B',
  border: '#E2E8F0',
  accent: '#EC4899',
};

// Génère les initiales
function getInitials(name?: string) {
  if (!name) return "?";
  const parts = name.split(" ");
  const first = parts[0]?.[0] ?? "";
  const last = parts[1]?.[0] ?? "";
  return (first + last).toUpperCase();
}

// ---------- Drawer personnalisé ----------
function ModernDrawer(props: any) {
  const { user, logout } = useAuth();

  const initials = getInitials(user?.nom);

  return (
    <View style={{ flex: 1 }}>
      
      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.initialsContainer}>
          <Text style={styles.initialsText}>{initials}</Text>
        </View>

        <Text style={styles.name}>{user?.nom ?? "Utilisateur"}</Text>
        <Text style={styles.email}>{user?.email ?? "email inconnu"}</Text>
      </View>

      {/* LISTE DES LIENS */}
      <DrawerContentScrollView 
        {...props}
        scrollEnabled={false}
        contentContainerStyle={styles.list}
      >
        <DrawerItemList {...props} />
      </DrawerContentScrollView>

      {/* FOOTER */}
      <View style={styles.footer}>
        <DrawerItem
          label="Déconnexion"
          icon={({ color, size }) => (
            <Ionicons name="log-out-outline" color={color} size={size} />
          )}
          onPress={logout}
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
      screenOptions={({ navigation }) => ({
        headerShown: true,
        drawerType: 'slide',
        drawerStyle: { width: 280, backgroundColor: colors.surface },
        overlayColor: 'rgba(0,0,0,0.3)',

        drawerActiveTintColor: '#fff',
        drawerInactiveTintColor: colors.textSecondary,
        drawerActiveBackgroundColor: colors.primary,
        drawerLabelStyle: { fontSize: 16, fontWeight: '600', marginLeft: 12 },
        drawerItemStyle: {
          borderRadius: 12,
          marginHorizontal: 12,
          marginVertical: 4,
          paddingVertical: 4,
        },

        // Header
        headerTintColor: colors.primary,
        headerTitleStyle: { fontWeight: '700', fontSize: 20, color: colors.text },

        // BOUTON PROFIL
        headerRight: () => {
  const { user } = useAuth();
  const initials = getInitials(user?.nom);

  return (
    <TouchableOpacity
      style={{ marginRight: 16 }}
      onPress={() => navigation.navigate("Profil")}
    >
      <View style={styles.initialsCircle}>
        <Text style={styles.initialsText}>{initials}</Text>
      </View>
    </TouchableOpacity>
  );
}
,
      })}
    >
      <Drawer.Screen
        name="Accueil"
        component={HomeScreen}
        options={{
          drawerIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />

      <Drawer.Screen
        name="Clients"
        component={CustomerStackNavigator}
        options={{
          drawerIcon: ({ color, size }) => (
            <Ionicons name="people-outline" size={size} color={color} />
          ),
        }}
      />

      <Drawer.Screen
        name="Produits"
        component={ProductStackNavigator}
        options={{
          drawerIcon: ({ color, size }) => (
            <Ionicons name="cube-outline" size={size} color={color} />
          ),
        }}
      />

      <Drawer.Screen
        name="Ventes"
        component={SalesStackNavigator}
        options={{
          drawerIcon: ({ color, size }) => (
            <Ionicons name="cart-outline" size={size} color={color} />
          ),
        }}
      />


      {/* Profil caché dans le drawer */}
      <Drawer.Screen
        name="Profil"
        component={ProfileScreen}
        options={{ drawerItemStyle: { height: 0 } }}
      />

      <Drawer.Screen
        name="Entreprise"
        component={CreateCompanyScreen}
        options={{
          drawerIcon: ({ color, size }) => (
            <Ionicons name="business-outline" size={size} color={color} />
          ),
        }}
      />

      <Drawer.Screen
        name="SecurityStack"
        component={SecurityStackNavigator}
        options={{ drawerItemStyle: { height: 0 } }} // invisible dans le menu
      />

    </Drawer.Navigator>
  );
}

// ---------- Styles ----------
const styles = StyleSheet.create({
  header: {
    paddingTop: 60,
    paddingBottom: 24,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: "center",
  },

  initialsContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },

  initialsText: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "700",
  },

  name: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },

  email: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },

  list: { paddingTop: 12 },

  footer: {
    borderTopWidth: 1,
    borderColor: colors.border,
    paddingBottom: 24,
  },

  logoutLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 12,
  },

  initialsCircle: {
  width: 36,
  height: 36,
  borderRadius: 18,
  backgroundColor: colors.primary,
  justifyContent: "center",
  alignItems: "center",
},



});
