import React from 'react';
import  { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import  { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from '../screens/HomeScreen';
import ProfileScreen from '../screens/ProfileScreen';
import Icon from 'react-native-vector-icons/Ionicons';

const Tab = createBottomTabNavigator();
const HomeStack = createStackNavigator();

function HomeStackScreen(params) {
  return (
    <HomeStack.Navigator>
      <HomeStack.Screen name="Home" component={HomeScreen} />
      {/* Adding this here keeps the Bottom Bar visible on the details page */}
      {/* <HomeStack.Screen name="ProductDetails" component={ProductDetailScreen} /> */}
    </HomeStack.Navigator>
  );
}

const BottomTabNav = () => {
  return (
    <Tab.Navigator>
        <Tab.Screen
            name="HomeTab"
            component={HomeStackScreen}
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