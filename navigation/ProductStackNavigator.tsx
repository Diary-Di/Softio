import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ProductScreen       from '../screens/ProductScreen';
import PriceScreen         from '../screens/PriceScreen';
import CategoryScreen      from '../screens/CategoryScreen';
import CreateProductScreen from '../screens/CreateProductScreen';
import withFadeBar         from '../components/withFadeBar';

export type ProductStackParamList = {
  ProductList   : undefined;
  CreateProduct : undefined;
  Price         : undefined;
  Category      : undefined;
};

const Stack = createNativeStackNavigator<ProductStackParamList>();

export default function ProductStackNavigator() {
  const ProductList   = withFadeBar(ProductScreen,    'produit');
  const Price         = withFadeBar(PriceScreen,      'prix');
  const Category      = withFadeBar(CategoryScreen,   'categorie');
  const CreateProduct = withFadeBar(CreateProductScreen, 'produit');

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ProductList"   component={ProductList} />
      <Stack.Screen name="Price"         component={Price} />
      <Stack.Screen name="Category"      component={Category} />
      <Stack.Screen name="CreateProduct" component={CreateProduct} />
    </Stack.Navigator>
  );
}