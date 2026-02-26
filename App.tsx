import React from 'react';
import { verifyInstallation } from 'nativewind';
import AppNavigator from './src/navigations';
// @ts-ignore
import "./global.css";
import { AuthProvider } from './src/context/AuthContext';

const App = () => {
  verifyInstallation();
  return (
    <AuthProvider>
      <AppNavigator />
    </AuthProvider>
  );
};

export default App;