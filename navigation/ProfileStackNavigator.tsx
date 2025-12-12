import { createStackNavigator } from '@react-navigation/stack';
import AddSpentScreen from '@/screens/AddSpentScreen';
import CreateCompanyScreen from '@/screens/CreateCompanyScreen';
import SpentScreen from '@/screens/SpentScreen';

export type ProfileStackParamList = {
    SpentList : undefined;
    AddSpent : undefined;
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
    <Stack.Screen name="AddSpent" component={AddSpentScreen} />
    </Stack.Navigator>
  );
}