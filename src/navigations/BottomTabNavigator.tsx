import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { View } from 'react-native';
import { useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { RootState } from '../utils/types';
import HomeScreen from '../screens/HomeScreen';
import CartScreen from '../screens/CartScreen';
import WishlistScreen from '../screens/WishlistScreen';
import OrderScreen from '../screens/OrderScreen';
import AccountScreen from '../screens/AccountScreen';
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
  const navigation = useNavigation<any>();

  // Redirect to Home when logging out from a protected tab
  React.useEffect(() => {
    if (!token) {
      // Find current route name by looking at the state of the navigator
      const state = navigation.getState();
      
      // We need to check both the current navigator and potentially nested navigators
      const currentRouteName = state?.routes[state.index]?.name;
      const protectedTabs = ['Cart', 'My Order', 'Account'];
      
      // If we are in the BottomTab, we might need to look deeper into its state
      let activeTabName = currentRouteName;
      if (currentRouteName === 'BottomTab' && state?.routes[state.index].state) {
        const tabState = state.routes[state.index].state;
        activeTabName = tabState?.routeNames?.[tabState.index || 0];
      }
      
      if (activeTabName && protectedTabs.includes(activeTabName)) {
        // Use a reset to clear the stack and ensure they go to Home
        navigation.reset({
          index: 0,
          routes: [{ name: 'HomeTab' as never }],
        });
      }
    }
  }, [token, navigation]);

  const protectedTabListener = ({ navigation: tabNav, route }: any) => ({
    tabPress: (e: any) => {
      if (!token) {
        e.preventDefault();
        navigation.navigate('Auth'); // Redirect to Auth stack
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