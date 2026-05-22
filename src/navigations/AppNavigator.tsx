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

const Stack = createStackNavigator();

export default function AppNavigator() {
  const dispatch = useDispatch();
  const [initializing, setInitializing] = useState(true);
  const authData = useSelector((state: RootState) => state.authentication?.data);
  const { data: customerData, isLoading: isCustomerLoading, isError: isCustomerError } = useSelector((state: RootState) => state.customer);

  useEffect(() => {
    const authInstance = getAuth();
    
    const subscriber = onAuthStateChanged(authInstance, (_user) => {
      setInitializing(false);
    });

    return subscriber;
  }, []);

  // 💡 Fetch missing global data on app start if already authenticated
  useEffect(() => {
    if (!initializing && authData?.token && authData?.user?.customer && !customerData && !isCustomerLoading && !isCustomerError) {
        console.log("🔄 AppNavigator: Re-fetching global customer data...");
        dispatch({ 
            type: Types.GET_CUSTOMER, 
            payload: { id: authData.user.customer, token: authData.token } 
        });
        dispatch({
            type: Types.GET_WALLET,
            payload: { id: authData.user.customer, token: authData.token }
        });
    }
  }, [initializing, authData, customerData, isCustomerLoading, isCustomerError, dispatch]);

  // Notification Foreground Handler
  useEffect(() => {
    const unsubscribeForeground = notifee.onForegroundEvent(({ type, detail }) => {
      switch (type) {
        case EventType.DISMISSED:
          console.log('User dismissed notification');
          break;
        case EventType.PRESS:
          console.log('User pressed notification', detail.notification);
          if (detail.notification?.body) {
            Alert.alert('Notification', detail.notification.body);
          }
          break;
      }
    });

    return () => {
      unsubscribeForeground();
    };
  }, []);

  if (initializing) {
    return (
      <View className="flex-1 items-center bg-white mt-48 ">
        <Image
          source={IMG.LOADING_LOGO}
          className="w-48 h-48 mt-20"
          resizeMode="contain"
        />
        <Text className="text-4xl font-montserrat-bold text-brand">Mifania</Text>
        
        <View className="absolute bottom-24">
          <ActivityIndicator 
            size="large" 
            color="#52622E" 
            style={{ transform: [{ scale: 2 }] }}
          />
        </View>
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
