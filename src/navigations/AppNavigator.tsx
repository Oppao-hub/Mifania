import React, { useEffect, useState } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { useDispatch, useSelector } from 'react-redux';
import { getAuth, onAuthStateChanged } from '@react-native-firebase/auth';
import notifee, { EventType } from '@notifee/react-native';

import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';
import { RootState } from '../utils/types';
import IMG from '../utils/image';
import { userLoginCompleted } from '../app/reducers/auth';
import { View, ActivityIndicator, Alert, Image, Text } from 'react-native';
import { setupSocket } from '../services/socket';

const Stack = createStackNavigator();

export default function AppNavigator() {
  const dispatch = useDispatch();
  const [initializing, setInitializing] = useState(true);
  const { data } = useSelector((state: RootState) => state.authentication || {data: null, isLoading: false});

  // Handle user state changes
  useEffect(() => {
    const authInstance = getAuth();
    const subscriber = onAuthStateChanged(authInstance, (user) => {
      if (user && data === null) {
        // Firebase has a user but Redux doesn't - Sync them!
        dispatch(userLoginCompleted({
          user: {
            id: user.uid,
            email: user.email || '',
            firstName: user.displayName || 'User',
          },
          token: 'firebase_session' // Or get token via user.getIdToken()
        }));
      }
      if (initializing) setInitializing(false);
    });
    return subscriber; // unsubscribe on unmount
  }, [data, initializing, dispatch]);

  // WebSocket Integration & Notification Foreground Handler
  useEffect(() => {
    let socket: any;

    // Foreground event handler
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

    if (data && data.user) {
      console.log('🔗 Setting up socket for user:', data.user.email);
      socket = setupSocket(data.user.email);
    }

    return () => {
      unsubscribeForeground();
      if (socket) {
        console.log('🔌 Disconnecting socket');
        socket.disconnect();
      }
    };
  }, [data]);

  if (initializing) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <Image
          source={IMG.LOGO}
          className="w-64 h-64 -mt-20"
          resizeMode="contain"
        />
        <Text className="text-4xl font-montserrat-bold text-brand">Mifania</Text>
        
        <View style={{ position: 'absolute', bottom: 100 }}>
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
      {data && data.user ? (
        <Stack.Screen name="Main" component={MainNavigator} />
      ) : (
        <Stack.Screen name="Auth" component={AuthNavigator} />
      )}
    </Stack.Navigator>
  );
}