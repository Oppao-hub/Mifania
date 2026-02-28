import React from 'react';
import  { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import  { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from '../screens/HomeScreen';
import CartScreen from '../screens/CartScreen';
import ProfileScreen from '../screens/ProfileScreen';
import Icon from 'react-native-vector-icons/Ionicons';

const Tab = createBottomTabNavigator();
const HomeStack = createStackNavigator();

function HomeStackScreen(params) {
  return (
    <HomeStack.Navigator>
      <HomeStack.Screen name="Home" component={HomeScreen} options={{ headerShown: false}}/>
      {/* Adding this here keeps the Bottom Bar visible on the details page */}
    </HomeStack.Navigator>
  );
}

const BottomTabNavigator = () => {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false}}>
        <Tab.Screen
          name="HomeTab"
          component={HomeStackScreen}
          options={{ tabBarIcon: ({color}) => <Icon name="home" color={color} size={20} /> }}
        />
        <Tab.Screen
          name="Cart"
          component={CartScreen}
          options={{ tabBarIcon: ({color}) => <Icon name="cart" color={color} size={20} /> }}
        />
        <Tab.Screen 
          name="Profile" 
          component={ProfileScreen} 
          options={{ tabBarIcon: ({color}) => <Icon name="person-circle-outline" color={color} size={20} /> }}
       />
    </Tab.Navigator>
  )
}

export default BottomTabNavigator;