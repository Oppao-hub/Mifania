import React, { useEffect, useState } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
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

const Stack = createStackNavigator();

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
    const unsubscribeForeground = notifee.onForegroundEvent(({ type, detail }) => {
      if (type === EventType.PRESS && detail.notification?.body) {
        Alert.alert('Notification', detail.notification.body);
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