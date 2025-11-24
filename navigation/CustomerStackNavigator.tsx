import { createNativeStackNavigator } from '@react-navigation/native-stack';
import withFadeBar from '../components/withFadeBar';
import CreateCustomerScreen from '../screens/CreateCustomerScreen';
import CustomerFollowUpScreen from '../screens/CustomerFollowUpScreen';
import CustomerScreen from '../screens/CustomerScreen';

export type CustomerStackParamList = {
  CustomerList: undefined;
  CreateCustomer: undefined;
  CustomerFollowUp: undefined;
};

const Stack = createNativeStackNavigator<CustomerStackParamList>();

export default function CustomerStackNavigator() {
  const CustomerList = withFadeBar(CustomerScreen, 'produit');
  const CreateCustomer = withFadeBar(CreateCustomerScreen, 'produit');
  const CustomerFollowUp = withFadeBar(CustomerFollowUpScreen, 'produit');

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="CustomerList" component={CustomerList} />
      <Stack.Screen name="CreateCustomer" component={CreateCustomer} />
      <Stack.Screen name="CustomerFollowUp" component={CustomerFollowUp} />
    </Stack.Navigator>
  );
}
