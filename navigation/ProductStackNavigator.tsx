import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ProductScreen    from '../screens/ProductScreen';
import PriceScreen      from '../screens/PriceScreen';
import CategoryScreen   from '../screens/CategoryScreen';
import CreateProductScreen from '../screens/CreateProductScreen';
import withFadeBar      from '../components/withFadeBar';

/* ---------- Types ---------- */
export type ProductStackParamList = {
  ProductList   : undefined;
  CreateProduct : undefined;
  Price         : undefined;
  Category      : undefined;
};

const Stack = createNativeStackNavigator<ProductStackParamList>();

export default function ProductStackNavigator() {
  /* onglet actif du bottom-bar */
  const [active, setActive] = React.useState<'produit' | 'prix' | 'categorie'>('produit');

  /* on “wrap” chaque écran avec le HOC qui gère le fade */
  const ProductList   = withFadeBar(ProductScreen,    'produit',   setActive);
  const Price         = withFadeBar(PriceScreen,      'prix',      setActive);
  const Category      = withFadeBar(CategoryScreen,   'categorie', setActive);
  const CreateProduct = withFadeBar(CreateProductScreen, 'produit', setActive);

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ProductList"   component={ProductList} />
      <Stack.Screen name="Price"         component={Price} />
      <Stack.Screen name="Category"      component={Category} />
      <Stack.Screen name="CreateProduct" component={CreateProduct} />
    </Stack.Navigator>
  );
}