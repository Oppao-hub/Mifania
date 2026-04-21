import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { useSelector } from 'react-redux';

import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';
import { RootState } from '../types';

const Stack = createStackNavigator();

export default function AppNavigator() {
  const { data } = useSelector((state: RootState) => state.authentication || {data: null, isLoading: false});

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {data === null ? (
        // User is not logged in
        <Stack.Screen name="Auth" component={AuthNavigator} />
      ) : (
        // User is logged in - MainNavigation contains the Bottom Tabs
        <Stack.Screen name="App" component={MainNavigator} />
      )}
    </Stack.Navigator>
  );
}