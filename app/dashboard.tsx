import { Ionicons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createDrawerNavigator } from "@react-navigation/drawer";
import React from "react";
import { TouchableOpacity } from "react-native";

import CustomerScreen from "./screens/CustomerScreen";
import HomeScreen from "./screens/HomeScreen";
import ProductScreen from "./screens/ProductScreen";
import SaleScreen from "./screens/SaleScreen";

const Drawer = createDrawerNavigator();
const Tab = createBottomTabNavigator();

// --- Bottom Tabs ---
function BottomTabs({ navigation }: any) {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        // 👇 Add menu icon on top-left
        headerLeft: () => (
          <TouchableOpacity
            onPress={() => navigation.openDrawer()}
            style={{ marginLeft: 15 }}
          >
            <Ionicons name="menu" size={28} color="#333" />
          </TouchableOpacity>
        ),
        // 👇 Add user icon on top-right
        headerRight: () => (
          <TouchableOpacity
            onPress={() => {
              // Add your user icon press handler here
              console.log("User icon pressed");
            }}
            style={{ marginRight: 15 }}
          >
            <Ionicons name="person-circle" size={28} color="#007AFF" />
          </TouchableOpacity>
        ),
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
      <Tab.Screen name="Accueil" component={HomeScreen} />
      <Tab.Screen name="Clients" component={CustomerScreen} />
      <Tab.Screen name="Produits" component={ProductScreen} />
      <Tab.Screen name="Ventes" component={SaleScreen} />
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