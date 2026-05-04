import React from 'react';
import { View } from 'react-native';
import { Provider } from 'react-redux';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { io } from "socket.io-client";  

import configureStore from './src/app/store'; 
import AppNavigation from './src/navigations';
import { toastConfig } from './src/utils/toastConfig';

const USER_ID = "1";
const { store } = configureStore();

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