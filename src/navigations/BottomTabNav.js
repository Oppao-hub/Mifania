import React from 'react';
import  { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../screens/HomeScreen';
import ProfileScreen from '../screens/ProfileScreen';
import Icon from 'react-native-vector-icons/Ionicons';

const Tab = createBottomTabNavigator();

const BottomTabNav = () => {
  return (
    <Tab.Navigator>
        <Tab.Screen
            name="Home"
            component={HomeScreen}
            options={{ tabBarIcon: ({color}) => <Icon name="home" color={color} size={20} /> }}
        />
        <Tab.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{ tabBarIcon: ({color}) => <Icon name="person-circle-outline" color={color} size={20} /> }}
      />
    </Tab.Navigator>
  )
}

export default BottomTabNav;