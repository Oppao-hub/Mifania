import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Platform, View } from 'react-native';
import HomeScreen from '../screens/HomeScreen';
import CartScreen from '../screens/CartScreen';
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
        tabBarShowLabel: false,
        tabBarActiveTintColor: BRAND_GREEN,
        tabBarInactiveTintColor: LIGHT_GRAY,
        tabBarStyle: {
          position: 'absolute',
          bottom: Platform.OS === 'ios' ? 30 : 20,
          left: 24,
          right: 24,
          height: 64,
          backgroundColor: '#FFFFFF',
          borderRadius: 32,
          borderTopWidth: 0,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.1,
          shadowRadius: 15,
          elevation: 10,
          paddingBottom: 0,
        },
        tabBarItemStyle: {
          height: 64,
          justifyContent: 'center',
          alignItems: 'center',
        },
        tabBarIconStyle: {
          width: 48,
          height: 48,
          justifyContent: 'center',
          alignItems: 'center',
        }
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeStackScreen}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <View className={`items-center justify-center w-12 h-12 rounded-full ${focused ? "bg-brand/10" : ""}`}>
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
          tabBarIcon: ({ color, focused }) => (
            <View className={`items-center justify-center w-12 h-12 rounded-full ${focused ? "bg-brand/10" : ""}`}>
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
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <View className={`items-center justify-center w-12 h-12 rounded-full ${focused ? "bg-brand/10" : ""}`}>
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