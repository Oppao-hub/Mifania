import React from 'react';
import { View } from 'react-native';

import AppNavigation from './src/navigations';

const App = () => {
  return (
    <View style={{ flex: 1 }}>
      <AppNavigation />
    </View>
  );
};

export default App;