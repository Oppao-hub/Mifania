import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import { ROUTES } from '../utils/routes';

export type AuthStackParamList = {
  [ROUTES.LOGIN]: undefined;
  [ROUTES.REGISTER]: undefined;
  [ROUTES.FORGOT_PASSWORD]: undefined;
  [ROUTES.RESEND_VERIFICATION]: undefined;
  [ROUTES.RESET_PASSWORD]: { token?: string } | undefined;
};

export type MainStackParamList = {
  BottomTab: undefined;
  [ROUTES.ORDER]: undefined;
  [ROUTES.ORDER_MANAGEMENT]: {
    orderId?: number;
    orderIri?: string;
    initialTab?: string;
  };
  [ROUTES.LEAVE_REVIEW]: { orderId: number; productId?: number };
  [ROUTES.PRODUCT_DETAILS]: { productId: number | string; product?: object };
  [ROUTES.CATEGORY_PRODUCTS]: { categoryId?: number; categoryName?: string };
  [ROUTES.SEARCH]: { query?: string } | undefined;
  [ROUTES.PROFILE]: undefined;
  [ROUTES.NOTIFICATION]: undefined;
  [ROUTES.ORDER_SUCCESS]: { orderId?: number };
  [ROUTES.CHECKOUT]: Record<string, unknown> | undefined;
  [ROUTES.MANAGE_ADDRESSES]: undefined;
  [ROUTES.EDIT_ADDRESS]: { addressId?: string };
  [ROUTES.CHOOSE_DELIVERY_ADDRESS]: {
    selectedAddressId?: string;
    sourceCheckoutRouteKey?: string;
  };
  [ROUTES.CHOOSE_DELIVERY]: {
    selectedDeliveryId?: string;
    sourceCheckoutRouteKey?: string;
  };
  [ROUTES.CHOOSE_PAYMENT_METHOD]: {
    selectedPaymentId?: string;
    checkoutTotal?: number;
    accountMode?: boolean;
    sourceCheckoutRouteKey?: string;
  };
  [ROUTES.PAYMENT_METHODS]: undefined;
  [ROUTES.ADD_PAYMENT_METHOD]: undefined;
  [ROUTES.APP_APPEARANCE]: undefined;
  [ROUTES.APPEARANCE_PICKER]: { kind: 'theme' | 'language' };
  [ROUTES.ACCOUNT_SECURITY]: undefined;
  [ROUTES.CHANGE_PASSWORD]: undefined;
  [ROUTES.PROMOS_VOUCHERS]: undefined;
  [ROUTES.WALLET]: undefined;
  [ROUTES.REWARDS]: undefined;
  [ROUTES.SUSTAINABILITY_STORY]: { storyId?: number };
  [ROUTES.ERROR]: { title?: string; message?: string };
};

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
};

export type AuthNavigationProp = NativeStackNavigationProp<AuthStackParamList>;
export type MainNavigationProp = NativeStackNavigationProp<MainStackParamList>;

export type AuthRouteProp<T extends keyof AuthStackParamList> = RouteProp<AuthStackParamList, T>;
export type MainRouteProp<T extends keyof MainStackParamList> = RouteProp<MainStackParamList, T>;
