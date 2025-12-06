// SalesStackNavigator.tsx
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import FloatingBottomBarSales from '@/components/FloatingBottomBarSales';
import SalesScreen from '../screens/SalesScreen';
import ProformaScreen from '@/screens/ProformaScreen';
import NewSalesScreen from '../screens/NewSalesScreen';
import NewProformaScreen from '@/screens/NewProformaScreen';
import ProformaValidationScreen from '../screens/ProformaValidationScreen';
import CartValidationScreen from '@/screens/CartValidationScreen';
import React from 'react';

export type SalesStackParamList = {
  SalesList: undefined;
  ProformaList: undefined;
  NewSales: undefined;
  NewProforma: undefined;
  CartValidation: { 
    cart: any[];
    totalAmount: number;
    totalItems: number;
    onSaleCompleted?: () => void;
  };
  ProformaValidation: { 
    proformaItems: any[];
    totalAmount: number;
    totalItems: number;
    onProformaCompleted?: () => void;
  };
};

const Stack = createNativeStackNavigator<SalesStackParamList>();

// Créez les composants wrappers AVANT le composant principal
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
    <Stack.Navigator 
      screenOptions={{ 
        headerShown: false,
        animation: 'slide_from_right',
      }}
      initialRouteName="SalesList"
    >
      <Stack.Screen name="SalesList" component={SalesScreenWithBar} />
      <Stack.Screen name="ProformaList" component={ProformaScreenWithBar} />
      <Stack.Screen name="NewSales" component={NewSalesScreen} />
      <Stack.Screen name="NewProforma" component={NewProformaScreen} />
      <Stack.Screen name="CartValidation" component={CartValidationScreen} />
      <Stack.Screen name="ProformaValidation" component={ProformaValidationScreen} />
    </Stack.Navigator>
  );
}