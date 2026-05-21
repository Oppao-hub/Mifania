import React, { useEffect, useState } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { useSelector } from 'react-redux';
import { getAuth, onAuthStateChanged } from '@react-native-firebase/auth';
import notifee, { EventType } from '@notifee/react-native';

import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';
import { RootState } from '../utils/types';
import IMG from '../utils/image';
import { View, ActivityIndicator, Alert, Image, Text } from 'react-native';

const Stack = createStackNavigator();

export default function AppNavigator() {
  const [initializing, setInitializing] = useState(true);
  const data = useSelector((state: RootState) => state.authentication?.data);

  useEffect(() => {
    const authInstance = getAuth();
    
    const subscriber = onAuthStateChanged(authInstance, (_user) => {
      setInitializing(false);
    });

    return subscriber;
  }, []);

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
      {data && data.token ? (
        <Stack.Screen name="Main" component={MainNavigator} />
      ) : (
        <>
          <Stack.Screen name="Main" component={MainNavigator} />
          <Stack.Screen name="Auth" component={AuthNavigator} />
        </>
      )}
    </Stack.Navigator>
  );
}
