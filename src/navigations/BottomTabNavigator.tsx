import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from '../screens/HomeScreen';
import CartScreen from '../screens/CartScreen';
import ProfileScreen from '../screens/ProfileScreen';
import Icon from 'react-native-vector-icons/Ionicons';

const Tab = createBottomTabNavigator();
const HomeStack = createStackNavigator();

const BRAND_GREEN = '#6B7C57';
const MOCHA = '#3D3D3D';
const GRAY_LIGHT = '#9ca3af';

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
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarActiveTintColor: BRAND_GREEN,
        tabBarInactiveTintColor: GRAY_LIGHT,
        // --- CENTERING LOGIC ---
        tabBarItemStyle: {
          justifyContent: 'center', // Centers vertically
          alignItems: 'center',     // Centers horizontally
        },
        tabBarStyle: {
          position: 'absolute',
          bottom: 25,
          left: 20,
          right: 20,
          height: 70, // Increased height slightly for better balance
          backgroundColor: 'white',
          borderRadius: 35, // High radius for a pill shape
          borderTopWidth: 0,
          elevation: 10,
          shadowColor: MOCHA,
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.15,
          shadowRadius: 10,
          paddingBottom: 0, // Removes default bottom padding for labels
        },
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeStackScreen}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <Icon 
              name={focused ? "home" : "home-outline"} 
              color={color} 
              size={28} // Increased from 24 to 28
            />
          ),
        }}
      />
      <Tab.Screen
        name="Cart"
        component={CartScreen}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <Icon 
              name={focused ? "cart" : "cart-outline"} 
              color={color} 
              size={28} // Increased from 24 to 28
            />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <Icon 
              name={focused ? "person" : "person-outline"} 
              color={color} 
              size={28}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default BottomTabNavigator;