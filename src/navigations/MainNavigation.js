import { createStackNavigator } from '@react-navigation/stack';
import { ROUTES } from '../utils';
import BottomTab from './BottomTabNav';

import HomeScreen from '../screens/HomeScreen';
import ProfileScreen from '../screens/ProfileScreen';
import Login from '../screens/auth/Login';
import Register from '../screens/auth/Register';

const Stack = createStackNavigator();

const MainNavigation = () => {
  return (
    <Stack.Navigator initialRouteName="Sag unsa ra">
      <Stack.Screen 
        name="Sag unsa ra" 
        component={BottomTab} 
        options={{ headerShown: false }}
      />
      <Stack.Screen name={ROUTES.HOME} component={HomeScreen} />
      <Stack.Screen name={ROUTES.PROFILE} component={ProfileScreen} />
      <Stack.Screen name={ROUTES.LOGIN} component={Login} />
      <Stack.Screen name={ROUTES.REGISTER} component={Register} />
    </Stack.Navigator>
  );
};

export default MainNavigation;
