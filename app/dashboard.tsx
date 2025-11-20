import { Ionicons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";
import { TouchableOpacity, View, StyleSheet, Platform } from "react-native";
import { BlurView } from 'expo-blur';

import CustomerScreen from "../screens/CustomerScreen";
import HomeScreen from "../screens/HomeScreen";
import ProductScreen from "../screens/ProductScreen";
import SaleScreen from "../screens/SaleScreen";
import CreateProductScreen from "../screens/CreateProductScreen";
import ProfileScreen from "../screens/ProfileScreen";

const Drawer = createDrawerNavigator();
const Tab = createBottomTabNavigator();
const ProductStack = createNativeStackNavigator();
const MainStack = createNativeStackNavigator();

// Palette de couleurs moderne
const colors = {
  primary: '#6366F1', // Indigo vibrant
  secondary: '#8B5CF6', // Violet
  accent: '#EC4899', // Rose
  background: '#F8FAFC',
  surface: '#FFFFFF',
  text: '#1E293B',
  textSecondary: '#64748B',
  border: '#E2E8F0',
  success: '#10B981',
  shadow: 'rgba(0, 0, 0, 0.08)',
};

// --- Product Stack Navigator ---
function ProductStackNavigator() {
  return (
    <ProductStack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.surface,
        },
        headerShadowVisible: false,
        headerTitleStyle: {
          fontWeight: '700',
          fontSize: 20,
          color: colors.text,
        },
        headerTintColor: colors.primary,
        contentStyle: {
          borderTopWidth: 1,
          borderTopColor: colors.border,
        },
      }}
    >
      <ProductStack.Screen 
        name="ProductList" 
        component={ProductScreen}
        options={{ 
          title: "Produits",
        }}
      />
      <ProductStack.Screen 
        name="CreateProduct" 
        component={CreateProductScreen}
        options={{ 
          headerShown: false,
          presentation: 'modal',
        }}
      />
    </ProductStack.Navigator>
  );
}

// --- Main Stack Navigator ---
function MainStackNavigator({ navigation }: any) {
  return (
    <MainStack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.surface,
        },
        headerShadowVisible: false,
        headerTitleStyle: {
          fontWeight: '700',
          fontSize: 20,
          color: colors.text,
        },
        headerTintColor: colors.primary,
      }}
    >
      <MainStack.Screen 
        name="BottomTabs" 
        component={BottomTabs}
        options={{ 
          headerShown: false 
        }}
      />
      <MainStack.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{ 
          title: "Profil",
          headerBackTitle: "Retour",
          presentation: 'card',
        }}
      />
    </MainStack.Navigator>
  );
}

// Composant pour les boutons d'en-tête avec effet moderne
const HeaderButton = ({ onPress, iconName, color = colors.text, badge = false }: any) => (
  <TouchableOpacity
    onPress={onPress}
    style={styles.headerButton}
    activeOpacity={0.7}
  >
    <View style={styles.headerButtonInner}>
      <Ionicons name={iconName} size={24} color={color} />
      {badge && <View style={styles.badge} />}
    </View>
  </TouchableOpacity>
);

// --- Bottom Tabs ---
function BottomTabs({ navigation }: any) {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        // Header configuration
        headerStyle: {
          backgroundColor: colors.surface,
          height: Platform.OS === 'ios' ? 100 : 70,
        },
        headerShadowVisible: false,
        headerLeft: () => (
          <HeaderButton
            onPress={() => navigation.openDrawer()}
            iconName="menu"
            color={colors.text}
          />
        ),
        headerRight: () => (
          <HeaderButton
            onPress={() => navigation.navigate("Profile")}
            iconName="person-circle"
            color={colors.primary}
          />
        ),
        headerTitleStyle: {
          fontWeight: '700',
          fontSize: 22,
          color: colors.text,
          letterSpacing: -0.5,
        },
        // Tab bar styling
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          height: Platform.OS === 'ios' ? 88 : 65,
          paddingBottom: Platform.OS === 'ios' ? 28 : 8,
          paddingTop: 8,
          elevation: 8,
          shadowColor: colors.shadow,
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginTop: 0,          // <- supprimé
          marginBottom: 2,       // (optionnel) petit espacement vers le bas
        },
        tabBarIcon: ({ color, size, focused }) => {
          let iconName: keyof typeof Ionicons.glyphMap = "home";

          if (route.name === "Accueil") {
            iconName = focused ? "home" : "home-outline";
          } else if (route.name === "Clients") {
            iconName = focused ? "people" : "people-outline";
          } else if (route.name === "Produits") {
            iconName = focused ? "cube" : "cube-outline";
          } else if (route.name === "Ventes") {
            iconName = focused ? "cart" : "cart-outline";
          }

          return (
            <View style={[
              styles.tabIconContainer,
              focused && styles.tabIconContainerActive
            ]}>
              <Ionicons name={iconName} size={size} color={color} />
            </View>
          );
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
      })}
    >
      <Tab.Screen 
        name="Accueil" 
        component={HomeScreen}
        options={{ title: "Accueil" }}
      />
      <Tab.Screen 
        name="Clients" 
        component={CustomerScreen}
        options={{ title: "Clients" }}
      />
      <Tab.Screen 
        name="Produits" 
        component={ProductStackNavigator}
        options={{ 
          title: "Produits",
          headerShown: false,
        }}
      />
      <Tab.Screen 
        name="Ventes" 
        component={SaleScreen}
        options={{ title: "Ventes" }}
      />
    </Tab.Navigator>
  );
}

// --- Drawer (Sidebar) ---
export default function Dashboard() {
  return (
    <Drawer.Navigator
      screenOptions={{
        headerShown: false,
        drawerType: "slide",
        drawerStyle: {
          backgroundColor: colors.surface,
          width: 280,
        },
        drawerActiveTintColor: colors.primary,
        drawerInactiveTintColor: colors.textSecondary,
        drawerLabelStyle: {
          fontSize: 16,
          fontWeight: '600',
          marginLeft: -16,
        },
        drawerItemStyle: {
          borderRadius: 12,
          marginHorizontal: 12,
          marginVertical: 4,
          paddingVertical: 4,
        },
        drawerActiveBackgroundColor: `${colors.primary}15`,
        overlayColor: 'rgba(0, 0, 0, 0.3)',
      }}
    >
      <Drawer.Screen
        name="MainStack"
        component={MainStackNavigator}
        options={{ 
          title: "Tableau de Bord",
          drawerIcon: ({ color, size }) => (
            <Ionicons name="grid" size={size} color={color} />
          ),
        }}
      />
    </Drawer.Navigator>
  );
}

const styles = StyleSheet.create({
  headerButton: {
    marginHorizontal: 16,
  },
  headerButtonInner: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${colors.primary}10`,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.accent,
    borderWidth: 2,
    borderColor: colors.surface,
  },
  tabIconContainer: {
    width: 50,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
  },
  tabIconContainerActive: {
    backgroundColor: `${colors.primary}15`,
  },
});