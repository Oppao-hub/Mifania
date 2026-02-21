import { createStackNavigator } from '@react-navigation/stack';
import { ROUTES } from '../utils';

import Login from '../screens/auth/Login';
import Register from '../screens/auth/Register';

const Stack = createStackNavigator();

const AuthNavigation = () => {
  return (
    <Stack.Navigator initialRouteName={ROUTES.LOGIN}>
      <Stack.Screen name={ROUTES.LOGIN} component={Login} />
      <Stack.Screen name={ROUTES.Register} component={Register} />
    </Stack.Navigator>
  );
};

export default AuthNavigation;
