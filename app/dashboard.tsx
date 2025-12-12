import { Ionicons } from '@expo/vector-icons';
import {
  DrawerContentScrollView,
  DrawerItem,
  createDrawerNavigator,
} from '@react-navigation/drawer';
import { useRouter } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { HiddenMenuProvider, useHiddenMenu } from '../contexts/HiddenMenuContext';
import { useAuth } from '../hooks/useAuth';
import CustomerStackNavigator from '../navigation/CustomerStackNavigator';
import ProductStackNavigator from '../navigation/ProductStackNavigator';
import ProfileStackNavigator from '@/navigation/ProfileStackNavigator';
import SalesStackNavigator from '../navigation/SalesStackNavigator';
import SecurityStackNavigator from '../navigation/SecurityStackNavigator';
import CreateCompanyScreen from '../screens/CreateCompanyScreen';
import HomeScreen from '../screens/HomeScreen';
import ProfileScreen from '../screens/ProfileScreen';
import SpentScreen from '../screens/SpentScreen';
import StateScreen from '../screens/StateScreen';

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
  const router = useRouter();
  const { hiddenMode, setHiddenMode } = useHiddenMenu();

  const initials = getInitials(user?.nom);

  // define which routes are shown in each mode:
  const hiddenOnly = ['Information', 'Dépses', 'Etats', 'Retour']; // label keys we'll map
  const normalOnly = ['Accueil', 'Clients', 'Produits', 'Ventes', 'Profil'];

  // map route name -> display label and icon
  const meta: Record<string, { label: string; icon: string }> = {
    Accueil: { label: 'Accueil', icon: 'home-outline' },
    Clients: { label: 'Clients', icon: 'people-outline' },
    Produits: { label: 'Produits', icon: 'cube-outline' },
    Ventes: { label: 'Ventes', icon: 'cart-outline' },
    Profil: { label: 'Profil', icon: 'person-circle-outline' },

    // hidden menu items (note: these names must match the Drawer.Screen names below)
    Information: { label: 'Information', icon: 'information-circle-outline' },
    Depenses: { label: 'Dépenses', icon: 'card-outline' },
    Etats: { label: 'États', icon: 'stats-chart-outline' },
    Retour: { label: 'Retour', icon: 'arrow-back-outline' },
  };

  // decide visible drawer entries
  const visibleNames = hiddenMode ? ['Information', 'Depenses', 'Etats', 'Retour'] : ['Accueil', 'Clients', 'Produits', 'Ventes', 'Profil'];

  return (
    <View style={{ flex: 1 }}>
      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.initialsContainer}>
          <Text style={styles.initialsText}>{initials}</Text>
        </View>
        <Text style={styles.name}>{user?.nom ?? 'Utilisateur'}</Text>
        <Text style={styles.email}>{user?.email ?? 'email inconnu'}</Text>
      </View>

      <DrawerContentScrollView {...props} contentContainerStyle={styles.list}>
        {visibleNames.map((name) => {
          const itemMeta = meta[name] ?? { label: name, icon: 'ellipse' };
          // special handling for "Retour"
          const onPress = () => {
            if (name === 'Retour') {
              setHiddenMode(false);
              // navigate to drawer 'Accueil' and close drawer
              props.navigation.navigate('Accueil');
              props.navigation.closeDrawer();
              return;
            }
            // navigate to the drawer screen and close drawer
            props.navigation.navigate(name);
            props.navigation.closeDrawer();
          };

          return (
            <DrawerItem
              key={name}
              label={itemMeta.label}
              icon={({ color, size }) => <Ionicons name={itemMeta.icon as any} color={color} size={size} />}
              onPress={onPress}
              activeTintColor={colors.accent}
              inactiveTintColor={colors.textSecondary}
              labelStyle={styles.drawerLabel}
            />
          );
        })}
      </DrawerContentScrollView>

      <View style={styles.footer}>
        <DrawerItem
          label="Déconnexion"
          icon={({ color, size }) => (
            <Ionicons name="log-out-outline" color={color} size={size} />
          )}
          onPress={async () => {
            try {
              await logout();
            } finally {
              router.replace('/(auth)/login');
            }
          }}
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
    <HiddenMenuProvider>
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

          // keep headerRight as before (note: hook usage inside headerRight might be questionable,
          // but left unchanged to preserve behavior)
          headerRight: () => {
            const { user } = useAuth();
            const initials = getInitials(user?.nom);
            return (
              <TouchableOpacity
                style={{ marginRight: 16 }}
                onPress={() => navigation.navigate('Profil')}
              >
                <View style={styles.initialsCircle}>
                  <Text style={styles.initialsText}>{initials}</Text>
                </View>
              </TouchableOpacity>
            );
          },
        })}
      >
        {/* Normal (main) screens */}
        <Drawer.Screen name="Accueil" component={HomeScreen} options={{ drawerIcon: ({ color, size }) => <Ionicons name="home-outline" color={color} size={size} /> }} />
        <Drawer.Screen name="Clients" component={CustomerStackNavigator} options={{ drawerIcon: ({ color, size }) => <Ionicons name="people-outline" color={color} size={size} /> }} />
        <Drawer.Screen name="Produits" component={ProductStackNavigator} options={{ drawerIcon: ({ color, size }) => <Ionicons name="cube-outline" color={color} size={size} /> }} />
        <Drawer.Screen name="Ventes" component={SalesStackNavigator} options={{ drawerIcon: ({ color, size }) => <Ionicons name="cart-outline" color={color} size={size} /> }} />

        {/* Profil (kept but hidden in custom drawer when not in hidden mode) */}
        <Drawer.Screen name="Profil" component={ProfileScreen} options={{ drawerItemStyle: { height: 0 } }} />

        {/* Security stack (kept) */}
        <Drawer.Screen name="SecurityStack" component={SecurityStackNavigator} options={{ drawerItemStyle: { height: 0 } }} />

        {/* Hidden menu screens (registered so navigation can target them) */}
        <Drawer.Screen name="Information" component={CreateCompanyScreen} options={{ drawerItemStyle: { height: 0 } }} />
        <Drawer.Screen name="Depenses" component={ProfileStackNavigator} options={{ drawerItemStyle: { height: 0 } }} />
        <Drawer.Screen name="Etats" component={StateScreen} options={{ drawerItemStyle: { height: 0 } }} />
        <Drawer.Screen name="Retour" component={HomeScreen} options={{ drawerItemStyle: { height: 0 } }} />
      </Drawer.Navigator>
    </HiddenMenuProvider>
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
    alignItems: 'center',
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

  drawerLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
});
