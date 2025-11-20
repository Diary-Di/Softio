import { Ionicons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";
import { TouchableOpacity } from "react-native";

import CustomerScreen from "./screens/CustomerScreen";
import HomeScreen from "./screens/HomeScreen";
import ProductScreen from "./screens/ProductScreen";
import SaleScreen from "./screens/SaleScreen";
import CreateProductScreen from "./screens/CreateProductScreen";
import ProfileScreen from "./screens/ProfileScreen";

const Drawer = createDrawerNavigator();
const Tab = createBottomTabNavigator();
const ProductStack = createNativeStackNavigator();
const MainStack = createNativeStackNavigator(); // Nouveau stack pour gérer la navigation vers le profil

// --- Product Stack Navigator ---
function ProductStackNavigator() {
  return (
    <ProductStack.Navigator>
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
          headerShown: false
        }}
      />
    </ProductStack.Navigator>
  );
}

// --- Main Stack Navigator (pour gérer la navigation vers le profil) ---
function MainStackNavigator({ navigation }: any) {
  return (
    <MainStack.Navigator>
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
          headerBackTitle: "Retour"
        }}
      />
    </MainStack.Navigator>
  );
}

// --- Bottom Tabs ---
function BottomTabs({ navigation }: any) {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        // Header configuration for all tabs
        headerLeft: () => (
          <TouchableOpacity
            onPress={() => navigation.openDrawer()}
            style={{ marginLeft: 15 }}
          >
            <Ionicons name="menu" size={28} color="#333" />
          </TouchableOpacity>
        ),
        headerRight: () => (
          <TouchableOpacity
            onPress={() => navigation.navigate("Profile")} // Navigation vers Profile
            style={{ marginRight: 15 }}
          >
            <Ionicons name="person-circle" size={28} color="#007AFF" />
          </TouchableOpacity>
        ),
        headerTitleStyle: {
          fontWeight: 'bold',
          fontSize: 18,
        },
        headerStyle: {
          backgroundColor: 'white',
        },
        // Tab bar icons
        tabBarIcon: ({ color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = "home";

          if (route.name === "Accueil") iconName = "home";
          else if (route.name === "Clients") iconName = "people";
          else if (route.name === "Produits") iconName = "cube";
          else if (route.name === "Ventes") iconName = "cart";

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: "#007AFF",
        tabBarInactiveTintColor: "gray",
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
        options={{ title: "Produits" }}
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
        drawerType: "front",
      }}
    >
      <Drawer.Screen
        name="MainStack"
        component={MainStackNavigator} // Utiliser MainStackNavigator au lieu de BottomTabs
        options={{ title: "Tableau de Bord" }}
      />
    </Drawer.Navigator>
  );
}