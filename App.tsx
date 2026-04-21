import React, { useEffect} from 'react';
import { View } from 'react-native';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { SafeAreaProvider } from 'react-native-safe-area-context';  

import Toast from 'react-native-toast-message'; 

// @ts-ignore
import configureStore from './src/app/store'; 
import AppNavigation from './src/navigations';

const { store, persistor } = configureStore();

const App = () => {
  useEffect(() => {
    console.log("Firebase App Name: ", App.name);
  },[]);
  return (
    <SafeAreaProvider>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <View style={{ flex: 1 }}>
            <AppNavigation />
            <Toast/>
          </View>
        </PersistGate>
      </Provider>
    </SafeAreaProvider>
  );
};

export default App;