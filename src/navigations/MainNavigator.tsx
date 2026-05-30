import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ROUTES } from '../utils';
import type { MainStackParamList } from '../types/navigation';
import BottomTab from './BottomTabNavigator';

import Order from '../screens/OrderScreen';
import OrderManagement from '../screens/OrderManagementScreen';
import LeaveReview from '../screens/LeaveReviewScreen';
import ProductDetails from '../screens/ProductDetailsScreen';
import Profile from '../screens/ProfileScreen';
import Notification from '../screens/NotificationScreen';
import OrderSuccess from '../screens/OrderSuccessScreen';
import Checkout from '../screens/CheckoutScreen';
import ManageAddresses from '../screens/ManageAddressesScreen';
import EditAddress from '../screens/EditAddressScreen';
import ChooseDeliveryAddress from '../screens/ChooseDeliveryAddressScreen';
import ChooseDelivery from '../screens/ChooseDeliveryScreen';
import ChoosePaymentMethod from '../screens/ChoosePaymentMethodScreen';
import PaymentMethods from '../screens/PaymentMethodsScreen';
import AddPaymentMethod from '../screens/AddPaymentMethodScreen';
import AppAppearance from '../screens/AppAppearanceScreen';
import AppearancePicker from '../screens/AppearancePickerScreen';
import PromosVouchers from '../screens/PromosVouchersScreen';
import Wallet from '../screens/WalletScreen';
import Rewards from '../screens/RewardsScreen';
import SustainabilityStory from '../screens/SustainabilityStoryScreen';
import CategoryProducts from '../screens/CategoryProductsScreen';
import Search from '../screens/SearchScreen';
import ErrorScreen from '../screens/ErrorScreen';
import AccountSecurity from '../screens/AccountSecurityScreen';
import ChangePassword from '../screens/ChangePasswordScreen';

const Stack = createNativeStackNavigator<MainStackParamList>();

const MainNavigator: React.FC = () => {
  return (
    <Stack.Navigator initialRouteName="BottomTab" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="BottomTab" component={BottomTab} options={{ headerShown: false }}/>
      <Stack.Screen name={ROUTES.ORDER} component={Order} />
      <Stack.Screen name={ROUTES.ORDER_MANAGEMENT} component={OrderManagement} />
      <Stack.Screen name={ROUTES.LEAVE_REVIEW} component={LeaveReview} />
      <Stack.Screen name={ROUTES.PRODUCT_DETAILS} component={ProductDetails} />
      <Stack.Screen name={ROUTES.CATEGORY_PRODUCTS} component={CategoryProducts} />
      <Stack.Screen name={ROUTES.SEARCH} component={Search} />
      <Stack.Screen name={ROUTES.PROFILE} component={Profile} />
      <Stack.Screen name={ROUTES.NOTIFICATION} component={Notification} />
      <Stack.Screen name={ROUTES.ORDER_SUCCESS} component={OrderSuccess} />
      <Stack.Screen name={ROUTES.CHECKOUT} component={Checkout} />
      <Stack.Screen name={ROUTES.MANAGE_ADDRESSES} component={ManageAddresses} />
      <Stack.Screen name={ROUTES.EDIT_ADDRESS} component={EditAddress} />
      <Stack.Screen name={ROUTES.CHOOSE_DELIVERY_ADDRESS} component={ChooseDeliveryAddress} />
      <Stack.Screen name={ROUTES.CHOOSE_DELIVERY} component={ChooseDelivery} />
      <Stack.Screen name={ROUTES.CHOOSE_PAYMENT_METHOD} component={ChoosePaymentMethod} />
      <Stack.Screen name={ROUTES.PAYMENT_METHODS} component={PaymentMethods} />
      <Stack.Screen name={ROUTES.ADD_PAYMENT_METHOD} component={AddPaymentMethod} />
      <Stack.Screen name={ROUTES.APP_APPEARANCE} component={AppAppearance} />
      <Stack.Screen name={ROUTES.APPEARANCE_PICKER} component={AppearancePicker} />
      <Stack.Screen name={ROUTES.ACCOUNT_SECURITY} component={AccountSecurity} />
      <Stack.Screen name={ROUTES.CHANGE_PASSWORD} component={ChangePassword} />
      <Stack.Screen name={ROUTES.PROMOS_VOUCHERS} component={PromosVouchers} />
      <Stack.Screen name={ROUTES.WALLET} component={Wallet} />
      <Stack.Screen name={ROUTES.REWARDS} component={Rewards} />
      <Stack.Screen name={ROUTES.SUSTAINABILITY_STORY} component={SustainabilityStory} />
      <Stack.Screen name={ROUTES.ERROR} component={ErrorScreen} />
    </Stack.Navigator>
  );
};

export default MainNavigator;
