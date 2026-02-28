import React from 'react';
import { View } from 'react-native';
import { verifyInstallation } from 'nativewind';
import { SafeAreaProvider } from 'react-native-safe-area-context';  
import AppNavigation from './src/navigations';
import { AuthProvider } from './src/context/AuthContext';
// @ts-ignore
import "./global.css";

const App = () => {

  verifyInstallation();

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <View style={{ flex: 1 }}>
          <AppNavigation />
        </View>
    </AuthProvider>
    </SafeAreaProvider>
  );
};

export default App;