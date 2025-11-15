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

const Drawer = createDrawerNavigator();
const Tab = createBottomTabNavigator();
const ProductStack = createNativeStackNavigator();

// --- Product Stack Navigator ---
function ProductStackNavigator() {
  return (
    <ProductStack.Navigator>
      <ProductStack.Screen 
        name="ProductList" 
        component={ProductScreen}
        options={{ 
          title: "Produits",
          // No custom header here - let the tab navigator handle it
        }}
      />
      <ProductStack.Screen 
        name="CreateProduct" 
        component={CreateProductScreen}
        options={{ 
          headerShown: false // Hide default header for form screens
        }}
      />
    </ProductStack.Navigator>
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
            onPress={() => console.log("User icon pressed")}
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
        name="MainTabs"
        component={BottomTabs}
        options={{ title: "Tableau de Bord" }}
      />
    </Drawer.Navigator>
  );
}