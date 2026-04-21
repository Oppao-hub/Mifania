import React from 'react';
import { View } from 'react-native';
import { Provider } from 'react-redux';
import { SafeAreaProvider } from 'react-native-safe-area-context';  

import Toast from 'react-native-toast-message'; 

// @ts-ignore
import configureStore from './src/app/store'; 
import AppNavigation from './src/navigations';

const { store } = configureStore();

const App = () => {
  return (
    <SafeAreaProvider>
      <Provider store={store}>
        <View style={{ flex: 1 }}>
          <AppNavigation />
          <Toast/>
        </View>
      </Provider>
    </SafeAreaProvider>
  );
};

export default App;