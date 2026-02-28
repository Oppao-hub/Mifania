import { createStackNavigator } from '@react-navigation/stack';
import { ROUTES } from '../utils';
import BottomTab from './BottomTabNavigator';

import Home from '../screens/HomeScreen'; 
import Cart from '../screens/CartScreen';
import Profile from '../screens/ProfileScreen';

const Stack = createStackNavigator();

const MainNavigator = () => {
  return (
    <Stack.Navigator initialRouteName="BottomTab" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="BottomTab" component={BottomTab} options={{ headerShown: false }}/>
      <Stack.Screen name={ROUTES.HOME} component={Home} />
      <Stack.Screen name={ROUTES.PROFILE} component={Profile} />
      <Stack.Screen name={ROUTES.CART} component={Cart} />
    </Stack.Navigator>
  );
};

export default MainNavigator;
