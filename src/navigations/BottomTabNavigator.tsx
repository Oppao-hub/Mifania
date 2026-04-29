import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { View } from 'react-native';
import HomeScreen from '../screens/HomeScreen';
import CartScreen from '../screens/CartScreen';
import WishlistScreen from '../screens/WishlistScreen';
import OrderScreen from '../screens/OrderScreen';
import ProfileScreen from '../screens/ProfileScreen';
import Icon from 'react-native-vector-icons/Ionicons';

const Tab = createBottomTabNavigator();
const HomeStack = createStackNavigator();

const BRAND_GREEN = '#52622E'; 
const LIGHT_GRAY = '#9CA3AF';

function HomeStackScreen() {
  return (
    <HomeStack.Navigator>
      <HomeStack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
    </HomeStack.Navigator>
  );
}

const BottomTabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      safeAreaInsets={{ bottom: 0 }} // Forces the navigator to ignore system safe area padding
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: BRAND_GREEN,
        tabBarInactiveTintColor: LIGHT_GRAY,
        tabBarLabelStyle: {
          fontSize: 10,
          fontFamily: 'Montserrat-Medium',
          marginBottom: 8,
        },
        tabBarStyle: {
          position: 'absolute',
          left: 24,
          right: 24,
          height: 70,
          backgroundColor: '#FFFFFF',
          borderTopWidth: 0,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.1,
          shadowRadius: 15,
          elevation: 10,
        },
        tabBarItemStyle: {
          paddingVertical: 8,
        },
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeStackScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <View className="items-center justify-center w-12 h-12">
              <Icon 
                name={focused ? "home" : "home-outline"} 
                color={color} 
                size={24} 
              />
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Cart"
        component={CartScreen}
        options={{
          tabBarLabel: 'Cart',
          tabBarIcon: ({ color, focused }) => (
            <View className="items-center justify-center w-12 h-12">
              <Icon 
                name={focused ? "cart" : "cart-outline"} 
                color={color} 
                size={24} 
              />
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Wishlist"
        component={WishlistScreen}
        options={{
          tabBarLabel: 'Wishlist',
          tabBarIcon: ({ color, focused }) => (
            <View className="items-center justify-center w-12 h-12">
              <Icon 
                name={focused ? "heart" : "heart-outline"} 
                color={color} 
                size={24} 
              />
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="My Order"
        component={OrderScreen}
        options={{
          tabBarLabel: 'My Order',
          tabBarIcon: ({ color, focused }) => (
            <View className="items-center justify-center w-12 h-12">
              <Icon 
                name={focused ? "document-text" : "document-text-outline"}
                color={color}
                size={24} 
              />
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
           tabBarLabel: 'Account',
          tabBarIcon: ({ color, focused }) => (
            <View className="items-center justify-center w-12 h-12">
              <Icon 
                name={focused ? "person" : "person-outline"} 
                color={color} 
                size={24} 
              />
            </View>
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default BottomTabNavigator;