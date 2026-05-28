import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../utils/types';
import HomeScreen from '../screens/HomeScreen';
import CartScreen from '../screens/CartScreen';
import WishlistScreen from '../screens/WishlistScreen';
import OrderScreen from '../screens/OrderScreen';
import AccountScreen from '../screens/AccountScreen';
import Icon from 'react-native-vector-icons/Ionicons';

const Tab = createBottomTabNavigator();
const HomeStack = createNativeStackNavigator();

const BRAND_GREEN = '#52622E'; 
const LIGHT_GRAY = '#9CA3AF';

function HomeStackScreen() {
  return (
    <HomeStack.Navigator>
      <HomeStack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
    </HomeStack.Navigator>
  );
}

const TabIcon = ({ name, color, focused }: { name: string; color: string; focused: boolean }) => (
  <View className="items-center justify-center w-12 h-12">
    <Icon 
      name={focused ? name : `${name}-outline`} 
      color={color} 
      size={24} 
    />
  </View>
);

const BottomTabNavigator: React.FC = () => {
  const token = useSelector((state: RootState) => state.authentication?.data?.token);

  const protectedTabListener = ({ navigation }: any) => ({
  tabPress: (e: any) => {
    if (!token) {
      e.preventDefault();
      navigation.navigate('Auth'); 
    }
  },
});


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
          tabBarIcon: ({ color, focused }) => <TabIcon name="home" color={color} focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Cart"
        component={CartScreen}
        listeners={protectedTabListener}
        options={{
          tabBarLabel: 'Cart',
          tabBarIcon: ({ color, focused }) => <TabIcon name="cart" color={color} focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Wishlist"
        component={WishlistScreen}
        options={{
          tabBarLabel: 'Wishlist',
          tabBarIcon: ({ color, focused }) => <TabIcon name="heart" color={color} focused={focused} />,
        }}
      />
      <Tab.Screen
        name="My Order"
        component={OrderScreen}
        listeners={protectedTabListener}
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
        name="Account"
        component={AccountScreen}
        listeners={protectedTabListener}
        options={{
          tabBarLabel: 'Account',
          tabBarIcon: ({ color, focused }) => <TabIcon name="person" color={color} focused={focused} />,
        }}
      />
    </Tab.Navigator>
  );
};

export default BottomTabNavigator;
