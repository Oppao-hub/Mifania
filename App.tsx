import React from 'react';
import { View } from 'react-native';
import { verifyInstallation } from 'nativewind';
import AppNavigation from './src/navigations';

const App = () => {
  
  verifyInstallation();

  return (
    <View style={{ flex: 1 }}>
      <AppNavigation />
    </View>
  );
};

export default App;