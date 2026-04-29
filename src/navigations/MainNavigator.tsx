import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { ROUTES } from '../utils';
import BottomTab from './BottomTabNavigator';

import Home from '../screens/HomeScreen'; 
import Cart from '../screens/CartScreen';
import Wishlist from '../screens/WishlistScreen';
import Order from '../screens/OrderScreen';
import ProductDetails from '../screens/ProductDetailsScreen';
import Profile from '../screens/ProfileScreen';

const Stack = createStackNavigator();

const MainNavigator: React.FC = () => {
  return (
    <Stack.Navigator initialRouteName="BottomTab" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="BottomTab" component={BottomTab} options={{ headerShown: false }}/>
      <Stack.Screen name={ROUTES.HOME} component={Home} />
      <Stack.Screen name={ROUTES.CART} component={Cart} />
      <Stack.Screen name={ROUTES.WISHLIST} component={Wishlist} />
      <Stack.Screen name={ROUTES.ORDER} component={Order} />
      <Stack.Screen name={ROUTES.PRODUCT_DETAILS} component={ProductDetails} />
      <Stack.Screen name={ROUTES.PROFILE} component={Profile} />
    </Stack.Navigator>
  );
};

export default MainNavigator;
