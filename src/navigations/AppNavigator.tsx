import React, { useEffect, useState } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { useDispatch, useSelector } from 'react-redux';
import auth from '@react-native-firebase/auth';

import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';
import { RootState } from '../types';
import { userLoginCompleted } from '../app/reducers/auth';
import { View, ActivityIndicator } from 'react-native';

const Stack = createStackNavigator();

export default function AppNavigator() {
  const dispatch = useDispatch();
  const [initializing, setInitializing] = useState(true);
  const { data } = useSelector((state: RootState) => state.authentication || {data: null, isLoading: false});

  // Handle user state changes
  useEffect(() => {
    const subscriber = auth().onAuthStateChanged((user) => {
      if (user && data === null) {
        // Firebase has a user but Redux doesn't - Sync them!
        dispatch(userLoginCompleted({
          user: {
            email: user.email || '',
            first_name: user.displayName || 'User',
          },
          token: 'firebase_session' // Or get token via user.getIdToken()
        }));
      }
      if (initializing) setInitializing(false);
    });
    return subscriber; // unsubscribe on unmount
  }, [data, initializing, dispatch]);

  if (initializing) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#52622E" />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {data === null ? (
        <Stack.Screen name="Auth" component={AuthNavigator} />
      ) : (
        <Stack.Screen name="App" component={MainNavigator} />
      )}
    </Stack.Navigator>
  );
}