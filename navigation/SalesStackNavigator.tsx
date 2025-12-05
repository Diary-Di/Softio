// SalesStackNavigator.tsx
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import FloatingBottomBarSales from '@/components/FloatingBottomBarSales';
import SalesScreen from '../screens/SalesScreen';
import ProformaScreen from '@/screens/ProformaScreen';
import NewSalesScreen from '../screens/NewSalesScreen'; // Importer NewSalesScreen
import React from 'react';

export type SalesStackParamList = {
  SalesList: undefined;
  proforma: undefined;
  NewSales: undefined; // Ajouter cette ligne
};

const Stack = createNativeStackNavigator<SalesStackParamList>();

// Composants wrappers
const SalesScreenWithBar = () => (
  <>
    <SalesScreen />
    <FloatingBottomBarSales active="ventes" />
  </>
);

const ProformaScreenWithBar = () => (
  <>
    <ProformaScreen />
    <FloatingBottomBarSales active="proforma" />
  </>
);


export default function SalesStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen 
        name="SalesList" 
        component={SalesScreenWithBar} 
      />
      <Stack.Screen 
        name="proforma" 
        component={ProformaScreenWithBar} 
      />
      <Stack.Screen 
        name="NewSales" 
        component={NewSalesScreen} 
      />
    </Stack.Navigator>
  );
}