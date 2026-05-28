import React, { useEffect, useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSelector, useDispatch } from 'react-redux';
import { getAuth, onAuthStateChanged } from '@react-native-firebase/auth';
import notifee, { EventType } from '@notifee/react-native';

import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';
import { RootState } from '../utils/types';
import IMG from '../utils/image';
import { View, ActivityIndicator, Alert, Image, Text } from 'react-native';
import * as Types from '../app/actions';
import { getCustomerRefFromUser } from '../utils/apiResource';
import { navigationRef } from '../utils/navigation';
import { ROUTES } from '../utils';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const dispatch = useDispatch();
  const authData = useSelector((state: RootState) => state.authentication?.data);
  
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
    
    // 💡 2. Add !isCustomerError to the condition
    // This acts as a circuit breaker. If the fetch fails once, it won't try again.
    if (!initializing && authData?.token && customerRef && !customerData && !isCustomerLoading && !isCustomerError) {
      dispatch({
        type: Types.GET_CUSTOMER,
        payload: { id: customerRef, token: authData.token },
      });
      dispatch({
        type: Types.GET_WALLET,
        payload: { id: customerRef, token: authData.token },
      });
    }
  }, [initializing, authData, customerData, isCustomerLoading, isCustomerError, dispatch]); // 💡 3. Add isCustomerError to dependencies

  useEffect(() => {
    if (!initializing && authData?.token) {
      dispatch({
        type: Types.GET_NOTIFICATIONS,
      });
    }
  }, [initializing, authData?.token, dispatch]);
  
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

      if (body) {
        Alert.alert('Notification', body);
      }
    });
    return unsubscribeForeground;
  }, []);

  if (initializing) {
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
          color="#52622E" 
          className="mt-10"
          style={{ transform: [{ scale: 2 }] }}
        />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {authData && authData.token ? (
        <Stack.Screen name="Main" component={MainNavigator} />
      ) : (
        <Stack.Screen name="Auth" component={AuthNavigator} />
      )}
    </Stack.Navigator>
  );
}