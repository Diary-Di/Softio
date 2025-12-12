import { createStackNavigator } from '@react-navigation/stack';
import CreateCompanyScreen from '@/screens/CreateCompanyScreen';
import SpentScreen from '@/screens/SpentScreen';
import StateScreen from '@/screens/StateScreen';
import SalesScreen from '@/screens/SalesScreen';

export type ProfileStackParamList = {
    States: undefined;
    SpentList : undefined;
    SalesSlist: undefined;
};

const Stack = createStackNavigator<ProfileStackParamList>();

export default function ProfileStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false, // tu gères le header toi-même dans chaque écran
      }}
    >
    <Stack.Screen name="SpentList" component={SpentScreen} />
    <Stack.Screen name="States" component={StateScreen} />
    <Stack.Screen name="SalesSlist" component={SalesScreen} />
    </Stack.Navigator>
  );
}