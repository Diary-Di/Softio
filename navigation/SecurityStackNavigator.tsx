// navigation/SecurityStackNavigator.tsx
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SecurityScreen from '../screens/SecurityScreen';

const Stack = createNativeStackNavigator();

export default function SecurityStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="Security"
        component={SecurityScreen}
        options={{ title: 'Sécurité' }}
      />
    </Stack.Navigator>
  );
}