import React from "react";
import { TouchableOpacity } from "react-native";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";

import HomeScreen from "./screens/HomeScreen";
import ProfileScreen from "./screens/ProfileScreen";
import SettingsScreen from "./screens/SettingsScreen";

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
        tabBarIcon: ({ color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = "home";

          if (route.name === "Home") iconName = "home";
          else if (route.name === "Profile") iconName = "person";
          else if (route.name === "Settings") iconName = "settings";

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: "#007AFF",
        tabBarInactiveTintColor: "gray",
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
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
        options={{ title: "Dashboard" }}
      />
    </Drawer.Navigator>
  );
}
