import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ROUTES } from '../utils';
import BottomTab from './BottomTabNavigator';

import Home from '../screens/HomeScreen'; 
import Cart from '../screens/CartScreen';
import Wishlist from '../screens/WishlistScreen';
import Order from '../screens/OrderScreen';
import OrderManagement from '../screens/OrderManagementScreen';
import ProductDetails from '../screens/ProductDetailsScreen';
import Profile from '../screens/ProfileScreen';
import Notification from '../screens/NotificationScreen';
import OrderSuccess from '../screens/OrderSuccessScreen';
import Checkout from '../screens/CheckoutScreen';
import ChooseDeliveryAddress from '../screens/ChooseDeliveryAddressScreen';
import ChooseDelivery from '../screens/ChooseDeliveryScreen';
import ChoosePaymentMethod from '../screens/ChoosePaymentMethodScreen';
import PromosVouchers from '../screens/PromosVouchersScreen';

const Stack = createNativeStackNavigator();

const MainNavigator: React.FC = () => {
  return (
    <Stack.Navigator initialRouteName="BottomTab" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="BottomTab" component={BottomTab} options={{ headerShown: false }}/>
      <Stack.Screen name={ROUTES.HOME} component={Home} />
      <Stack.Screen name={ROUTES.CART} component={Cart} />
      <Stack.Screen name={ROUTES.WISHLIST} component={Wishlist} />
      <Stack.Screen name={ROUTES.ORDER} component={Order} />
      <Stack.Screen name={ROUTES.ORDER_MANAGEMENT} component={OrderManagement} />
      <Stack.Screen name={ROUTES.PRODUCT_DETAILS} component={ProductDetails} />
      <Stack.Screen name={ROUTES.PROFILE} component={Profile} />
      <Stack.Screen name={ROUTES.NOTIFICATION} component={Notification} />
      <Stack.Screen name={ROUTES.ORDER_SUCCESS} component={OrderSuccess} />
      <Stack.Screen name={ROUTES.CHECKOUT} component={Checkout} />
      <Stack.Screen name={ROUTES.CHOOSE_DELIVERY_ADDRESS} component={ChooseDeliveryAddress} />
      <Stack.Screen name={ROUTES.CHOOSE_DELIVERY} component={ChooseDelivery} />
      <Stack.Screen name={ROUTES.CHOOSE_PAYMENT_METHOD} component={ChoosePaymentMethod} />
      <Stack.Screen name={ROUTES.PROMOS_VOUCHERS} component={PromosVouchers} />
    </Stack.Navigator>
  );
};

export default MainNavigator;
