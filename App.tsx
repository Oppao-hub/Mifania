import React from 'react';
import { View } from 'react-native';
import { Provider } from 'react-redux';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

import store from './src/app/store'; 
import AppNavigation from './src/navigations';
import { toastConfig } from './src/utils/toastConfig';

const App = () => {
  
  return (
    <SafeAreaProvider>
      <Provider store={store}>
        <View style={{ flex: 1 }}>
          <AppNavigation />
          <Toast config={toastConfig} />
        </View>
      </Provider>
    </SafeAreaProvider>
  );
};

export default App;