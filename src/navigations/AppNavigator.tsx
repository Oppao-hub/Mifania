import React, { useEffect, useState, useCallback } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSelector, useDispatch } from 'react-redux';
import { getAuth, onAuthStateChanged } from '@react-native-firebase/auth';
import notifee, { EventType } from '@notifee/react-native';

import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';
import { RootState } from '../utils/types';
import IMG from '../utils/image';
import { View, Image, Text, ActivityIndicator } from 'react-native';
import { LOADING_INDICATOR_COLOR } from '../components/LoadingState';
import * as Types from '../app/actions';
import { getCustomerRefFromUser } from '../utils/apiResource';
import { navigationRef } from '../utils/navigation';
import { ROUTES } from '../utils';
import { showBlockingInfo } from '../utils/userFeedback';
import { useAppForegroundSync } from '../hooks/useLiveSync';
import { LIVE_SYNC_ORDER_POLL_MS } from '../config/realtime';
import store from '../app/store';
import { startPushTokenRefreshListener, buildPushRegistrationContext, syncDevicePushToken, initializePushNotifications, resetCachedNotificationPermission } from '../services/pushNotifications';
import { isJwtUsable } from '../utils/jwtToken';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const dispatch = useDispatch();
  const authData = useSelector((state: RootState) => state.authentication?.data);
  const sessionValidated = useSelector((state: RootState) => state.authentication?.sessionValidated ?? false);
  const hasUsableSession = Boolean(authData?.token && isJwtUsable(authData.token) && sessionValidated);
  
  // 💡 1. Pull isError from the customer slice
  const { data: customerData, isLoading: isCustomerLoading, isError: isCustomerError } = useSelector((state: RootState) => state.customer);
  
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const authInstance = getAuth();
    const subscriber = onAuthStateChanged(authInstance, () => {
      setInitializing(false);
    });
    return subscriber;
  }, []);

  useEffect(() => {
    const customerRef = getCustomerRefFromUser(authData?.user);

    if (!initializing && hasUsableSession && customerRef && !customerData && !isCustomerLoading && !isCustomerError) {
      dispatch({
        type: Types.GET_CUSTOMER,
        payload: { id: customerRef, token: authData!.token },
      });
      dispatch({
        type: Types.GET_WALLET,
        payload: { id: customerRef, token: authData!.token },
      });
    }
  }, [initializing, hasUsableSession, authData, customerData, isCustomerLoading, isCustomerError, dispatch]);

  useEffect(() => {
    if (!initializing && hasUsableSession && authData?.token) {
      dispatch({ type: Types.SOCKET_ENSURE_CONNECTED });
      dispatch({ type: Types.GET_ORDERS, payload: authData.token });
      dispatch({ type: Types.GET_NOTIFICATIONS });
      dispatch({ type: Types.GET_WISHLIST });

      const registrationContext = buildPushRegistrationContext(authData.user);
      resetCachedNotificationPermission();
      void initializePushNotifications(true).finally(() => {
        void syncDevicePushToken(authData.token, registrationContext);
      });
      startPushTokenRefreshListener(
        () => store.getState().authentication.data?.token,
        () => buildPushRegistrationContext(store.getState().authentication.data?.user),
      );
    }
  }, [initializing, hasUsableSession, authData?.token, authData?.user?.id, dispatch]);

  const syncOnForeground = useCallback(() => {
    if (!hasUsableSession || !authData?.token) {
      return;
    }
    dispatch({ type: Types.SOCKET_ENSURE_CONNECTED });
    dispatch({ type: Types.GET_ORDERS, payload: authData.token });
    dispatch({ type: Types.GET_NOTIFICATIONS });
    dispatch({ type: Types.GET_CART });
    dispatch({ type: Types.GET_PRODUCTS });
    dispatch({ type: Types.GET_CATEGORIES });
    dispatch({ type: Types.GET_WISHLIST });

    resetCachedNotificationPermission();
    void initializePushNotifications(true).finally(() => {
      void syncDevicePushToken(authData.token, buildPushRegistrationContext(authData.user));
    });
  }, [hasUsableSession, authData?.token, authData?.user, dispatch]);

  useAppForegroundSync(syncOnForeground, !initializing && hasUsableSession);

  useEffect(() => {
    if (initializing || !hasUsableSession || !authData?.token) {
      return undefined;
    }

    const timer = setInterval(() => {
      dispatch({ type: Types.GET_ORDERS, payload: authData.token });
    }, LIVE_SYNC_ORDER_POLL_MS);

    return () => clearInterval(timer);
  }, [initializing, hasUsableSession, authData?.token, dispatch]);
  
  useEffect(() => {
    const unsubscribeForeground = notifee.onForegroundEvent(({ type, detail }) => {
      if (type !== EventType.PRESS) return;

      const data = detail.notification?.data as Record<string, string> | undefined;
      const body = detail.notification?.body;
      const title = detail.notification?.title;

      const sourceText = `${data?.type || ''} ${data?.targetUrl || ''} ${data?.title || ''} ${data?.message || ''} ${title || ''} ${body || ''}`.toLowerCase();
      const isOrderRelated = sourceText.includes('order') || sourceText.includes('tracking');
      const targetUrlOrderId = Number(String(data?.targetUrl || '').match(/\/orders?\/(\d+)/i)?.[1]);
      const bodyOrderId = Number(String(body || data?.message || '').match(/order\s*#?\s*(\d+)/i)?.[1]);
      const directOrderId = Number(data?.orderId);
      const orderId = !Number.isNaN(directOrderId)
        ? directOrderId
        : !Number.isNaN(targetUrlOrderId)
          ? targetUrlOrderId
          : !Number.isNaN(bodyOrderId)
            ? bodyOrderId
            : undefined;

      if (isOrderRelated && navigationRef.isReady()) {
        if (orderId && orderId > 0) {
          navigationRef.navigate('Main' as never, {
            screen: ROUTES.ORDER_MANAGEMENT,
            params: {
              orderId,
              orderIri: `/api/orders/${orderId}`,
              initialTab: 'Tracking',
            },
          } as never);
        } else {
          navigationRef.navigate('Main' as never, {
            screen: 'BottomTab',
            params: { screen: 'My Order' },
          } as never);
        }
        return;
      }

      const isSecurityNotification =
        String(data?.type || '').toLowerCase() === 'security'
        || sourceText.includes('security')
        || sourceText.includes('login');

      if (isSecurityNotification && navigationRef.isReady()) {
        navigationRef.navigate('Main' as never, {
          screen: 'BottomTab',
          params: { screen: 'Account' },
        } as never);
        return;
      }

      if (body) {
        showBlockingInfo({ title: 'Notification', message: body });
      }
    });
    return unsubscribeForeground;
  }, []);

  const isRestoringSession = Boolean(authData?.token && !sessionValidated);

  if (initializing || isRestoringSession) {
    return (
      <View className="flex-1 items-center bg-white justify-center">
        <Image
          source={IMG.LOADING_LOGO}
          className="w-48 h-48"
          resizeMode="contain"
        />
        <Text className="text-4xl font-montserrat-bold text-brand mt-4">Mifania</Text>
        <ActivityIndicator
          size="large"
          color={LOADING_INDICATOR_COLOR}
          className="mt-10"
          style={{ transform: [{ scale: 2 }] }}
        />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {hasUsableSession ? (
        <Stack.Screen name="Main" component={MainNavigator} />
      ) : (
        <Stack.Screen name="Auth" component={AuthNavigator} />
      )}
    </Stack.Navigator>
  );
}