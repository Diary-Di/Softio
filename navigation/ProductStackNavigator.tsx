import { createNativeStackNavigator } from '@react-navigation/native-stack';
import withFadeBar from '../components/withFadeBar';
import CategoryScreen from '../screens/CategoryScreen';
import CreateCategoryScreen from '../screens/CreateCategoryScreen';
import CreateProductScreen from '../screens/CreateProductScreen';
import PriceScreen from '../screens/PriceScreen';
import ProductScreen from '../screens/ProductScreen';
import EditProductScreen from '@/screens/EditProductScreen';

export type ProductStackParamList = {
  ProductList   : undefined;
  CreateProduct : undefined;
  Price         : undefined;
  Category      : undefined;
  CreateCategory: undefined;
  EditProduct   : { product: any };
};

const Stack = createNativeStackNavigator<ProductStackParamList>();

export default function ProductStackNavigator() {
  const ProductList   = withFadeBar(ProductScreen,    'produit');
  const Price         = withFadeBar(PriceScreen,      'prix');
  const Category      = withFadeBar(CategoryScreen,   'categorie');
  const CreateProduct = withFadeBar(CreateProductScreen, 'produit');
  const CreateCategory = withFadeBar(CreateCategoryScreen, 'categorie');
  const EditProduct   = withFadeBar(EditProductScreen, 'produit');

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ProductList"   component={ProductList} />
      <Stack.Screen name="Price"         component={Price} />
      <Stack.Screen name="Category"      component={Category} />
      <Stack.Screen name="CreateProduct" component={CreateProduct} />
      <Stack.Screen name="CreateCategory" component={CreateCategory} />
      <Stack.Screen name="EditProduct"   component={EditProduct} />
    </Stack.Navigator>
  );
}