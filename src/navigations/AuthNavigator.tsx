import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ROUTES } from '../utils';
import type { AuthStackParamList } from '../types/navigation';

import Login from '../screens/auth/LoginScreen';
import Register from '../screens/auth/RegisterScreen';
import ForgotPassword from '../screens/auth/ForgotPasswordScreen';
import ResendVerification from '../screens/auth/ResendVerificationScreen';
import ResetPassword from '../screens/auth/ResetPasswordScreen';

const Stack = createNativeStackNavigator<AuthStackParamList>();

const AuthNavigator: React.FC = () => {
  return (
    <Stack.Navigator initialRouteName={ROUTES.LOGIN} screenOptions={{ headerShown: false }}>
      <Stack.Screen name={ROUTES.LOGIN} component={Login} />
      <Stack.Screen name={ROUTES.REGISTER} component={Register} />
      <Stack.Screen name={ROUTES.FORGOT_PASSWORD} component={ForgotPassword} />
      <Stack.Screen name={ROUTES.RESEND_VERIFICATION} component={ResendVerification} />
      <Stack.Screen
        name={ROUTES.RESET_PASSWORD}
        component={ResetPassword}
        initialParams={{ token: undefined }}
      />
    </Stack.Navigator>
  );
};

export default AuthNavigator;
