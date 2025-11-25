import { Ionicons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Pressable } from "react-native";

import ProductStackNavigator from '../navigation/ProductStackNavigator';
import SalesStackNavigator from '../navigation/SalesStackNavigator';
import CustomerScreen from "../screens/CustomerScreen";
import HomeScreen from "../screens/HomeScreen";

const Tab = createBottomTabNavigator();

export default function MainNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
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
        headerShown: true,
        headerRight: () => (
          <Pressable
            onPress={() => {
              // Add your user icon press handler here
              // For example: navigation.navigate('Profile') or open a modal
              console.log("User icon pressed");
            }}
            style={{ marginRight: 15 }}
          >
            <Ionicons name="person-circle" size={28} color="#007AFF" />
          </Pressable>
        ),
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      })}
    >
      <Tab.Screen name="Accueil" component={HomeScreen} />
      <Tab.Screen name="Clients" component={CustomerScreen} />
      <Tab.Screen name="Produits" component={ProductStackNavigator} />
      <Tab.Screen name="Ventes" component={SalesStackNavigator} />
    </Tab.Navigator>
  );
}