import React from 'react';
import { View } from 'react-native';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

import store, { persistor } from './src/app/store'; 
import AppNavigation from './src/navigations';
import { toastConfig } from './src/utils/toastConfig';
import NetworkBanner from './src/components/NetworkBanner';

// Configure Google Sign-In at the very top level
GoogleSignin.configure({
  webClientId: '300896200734-ti08h9ju74onbmmsl1v9oq011qtvgj1e.apps.googleusercontent.com',
  offlineAccess: true,
  forceCodeForRefreshToken: true,
});

const App = () => {
  return (
    <SafeAreaProvider>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <View style={{ flex: 1 }}>
            <NetworkBanner />
            <AppNavigation />
            <Toast config={toastConfig} />
          </View>
        </PersistGate>
      </Provider>
    </SafeAreaProvider>
  );
};

export default App;
