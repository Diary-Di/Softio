import { createNativeStackNavigator } from '@react-navigation/native-stack';
import withFadeBar from '../components/withFadeBar';
import NewSalesScreen from '../screens/NewSalesScreen';
import SalesScreen from '../screens/SalesScreen';
import CartValidationScreen from "../screens/CartValidationScreen";

export type SalesStackParamList = {
  SaleList: undefined;
  NewSale: undefined;
  CartValidation: undefined;
};

const Stack = createNativeStackNavigator<SalesStackParamList>();

export default function SalesStackNavigator() {
  const SaleList = withFadeBar(SalesScreen, 'produit');
  const NewSale = withFadeBar(NewSalesScreen, 'produit');
    const CartValidation = withFadeBar(CartValidationScreen, 'produit');

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="SaleList" component={SaleList} />
      <Stack.Screen name="NewSale" component={NewSale} />
      <Stack.Screen name="CartValidation" component={CartValidation} />
    </Stack.Navigator>
  );
}
