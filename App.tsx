import React, { useEffect } from 'react'; // 💡 ADDED useEffect
import { View } from 'react-native';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

// 💡 ADDED IMPORTS
import messaging from '@react-native-firebase/messaging';
import notifee, { AndroidImportance } from '@notifee/react-native';

import store, { persistor } from './src/app/store'; 
import AppNavigation from './src/navigations';
import { toastConfig } from './src/utils/toastConfig';
import NetworkBanner from './src/components/NetworkBanner';

// Configure Google Sign-In at the very top level
console.log("📍 App: Configuring Google Sign-In...");
GoogleSignin.configure({
  webClientId: '300896200734-ti08h9ju74onbmmsl1v9oq011qtvgj1e.apps.googleusercontent.com',
  offlineAccess: true,
  forceCodeForRefreshToken: true,
});

const App = () => {

  // 💡 ADDED: Setup Notification Channel & Foreground Listener
  useEffect(() => {
    // 1. Create a channel (Required for Android 8.0+)
    const createChannel = async () => {
      await notifee.createChannel({
        id: 'default',
        name: 'Default Channel',
        importance: AndroidImportance.HIGH,
      });
    };
    createChannel();

    // 2. Listen for messages when the app is OPEN
    const unsubscribe = messaging().onMessage(async remoteMessage => {
      console.log('A new FCM message arrived in the foreground!', JSON.stringify(remoteMessage));

      // 3. Display the notification manually
      await notifee.displayNotification({
        title: remoteMessage.notification?.title || 'New Notification',
        body: remoteMessage.notification?.body || '',
        android: {
          channelId: 'default',
          importance: AndroidImportance.HIGH,
          pressAction: {
            id: 'default',
          },
        },
      });
    });

    return unsubscribe; // Cleanup listener on unmount
  }, []);

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