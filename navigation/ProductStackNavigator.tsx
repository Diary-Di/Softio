import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import ProductScreen from '../screens/ProductScreen';
import CreateProductScreen from '../screens/CreateProductScreen';
import { ProductStackParamList } from '../screens/ProductScreen';

const Stack = createStackNavigator<ProductStackParamList>();

export default function ProductStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen 
        name="ProductList" 
        component={ProductScreen}
        
      />
      <Stack.Screen 
        name="CreateProduct" 
        component={CreateProductScreen}
        
      />
    </Stack.Navigator>
  );
}