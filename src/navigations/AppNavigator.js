import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import AuthNavigator from './AuthNavigator'; // Your Auth Stack
import MainNavigator from './MainNavigator'; // Your Tab + App Stack

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { isLoggedIn } = useAuth(); // Using the boolean we discussed

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isLoggedIn === false ? (
        // User is not logged in
        <Stack.Screen name="Auth" component={AuthNavigator} />
      ) : (
        // User is logged in - MainNavigation contains the Bottom Tabs
        <Stack.Screen name="App" component={MainNavigator} />
      )}
    </Stack.Navigator>
  );
}