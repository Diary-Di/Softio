import { createStackNavigator } from '@react-navigation/stack';
import AddSpentScreen from '@/screens/AddSpentScreen';
import CreateCompanyScreen from '@/screens/CreateCompanyScreen';
import SpentScreen from '@/screens/SpentScreen';

export type ProfileStackParamList = {
    Company : undefined;
    AddSpent : undefined;
    SpentList : undefined;
};

const Stack = createStackNavigator<ProfileStackParamList>();

export default function ProfileStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false, // tu gères le header toi-même dans chaque écran
      }}
    >
    <Stack.Screen name="Company" component={CreateCompanyScreen} />
    <Stack.Screen name="AddSpent" component={AddSpentScreen} />
    <Stack.Screen name="SpentList" component={SpentScreen} />
    </Stack.Navigator>
  );
}