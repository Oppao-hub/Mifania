import React, { useEffect } from 'react'; // 💡 ADDED useEffect
import { LogBox, View } from 'react-native';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { SafeAreaProvider, initialWindowMetrics } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

// 💡 ADDED IMPORTS
import { getApp } from '@react-native-firebase/app';
import { getMessaging, onMessage, onNotificationOpenedApp, getInitialNotification } from '@react-native-firebase/messaging';
import notifee, { AndroidImportance } from '@notifee/react-native';

import store, { persistor } from './src/app/store'; 
import AppNavigation from './src/navigations';
import { toastConfig } from './src/utils/toastConfig';
import NetworkBanner from './src/components/NetworkBanner';
import AppErrorBoundary from './src/components/AppErrorBoundary';
import { AppearanceProvider } from './src/context/AppearanceContext';
import { navigationRef } from './src/utils/navigation';
import { ROUTES } from './src/utils';

// Configure Google Sign-In at the very top level
console.log("📍 App: Configuring Google Sign-In...");
GoogleSignin.configure({
  webClientId: '300896200734-ti08h9ju74onbmmsl1v9oq011qtvgj1e.apps.googleusercontent.com',
  offlineAccess: true,
  forceCodeForRefreshToken: true,
});

const App = () => {
  useEffect(() => {
    LogBox.ignoreLogs([
      'SafeAreaView has been deprecated',
    ]);
  }, []);

  const navigateToMyOrders = () => {
    if (!navigationRef.isReady()) return;
    navigationRef.navigate('Main' as never, {
      screen: 'BottomTab',
      params: { screen: 'My Order' },
    } as never);
  };

  const openOrderTracking = (orderId?: number) => {
    if (!orderId || Number.isNaN(orderId)) {
      navigateToMyOrders();
      return;
    }

    const navigateToTracking = () => {
      navigationRef.navigate('Main' as never, {
        screen: ROUTES.ORDER_MANAGEMENT,
        params: {
          orderId,
          orderIri: `/api/orders/${orderId}`,
          initialTab: 'Tracking',
        },
      } as never);
    };

    if (navigationRef.isReady()) {
      navigateToTracking();
      return;
    }

    let attempts = 0;
    const maxAttempts = 10;
    const retryTimer = setInterval(() => {
      attempts += 1;
      if (navigationRef.isReady()) {
        clearInterval(retryTimer);
        navigateToTracking();
      } else if (attempts >= maxAttempts) {
        clearInterval(retryTimer);
      }
    }, 300);
  };

  const maybeHandleOrderMessage = (payload: any): boolean => {
    const data = payload?.data || {};
    const title = String(payload?.notification?.title || data?.title || '');
    const body = String(payload?.notification?.body || data?.message || '');
    const type = String(data?.type || '');
    const targetUrl = String(data?.targetUrl || '');

    const sourceText = `${type} ${targetUrl} ${title} ${body}`.toLowerCase();
    const isOrderRelated = sourceText.includes('order') || sourceText.includes('tracking');

    if (!isOrderRelated) return false;

    const directOrderId = Number(data?.orderId);
    const targetUrlOrderId = Number(targetUrl.match(/\/orders?\/(\d+)/i)?.[1]);
    const bodyOrderId = Number(body.match(/order\s*#?\s*(\d+)/i)?.[1]);
    const orderId = !Number.isNaN(directOrderId)
      ? directOrderId
      : !Number.isNaN(targetUrlOrderId)
        ? targetUrlOrderId
        : !Number.isNaN(bodyOrderId)
          ? bodyOrderId
          : undefined;

    openOrderTracking(orderId);
    return true;
  };

  // 💡 ADDED: Setup Notification Channel & Foreground Listener
  useEffect(() => {
    const messagingInstance = getMessaging(getApp());

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
    const unsubscribe = onMessage(messagingInstance, async remoteMessage => {
      console.log('A new FCM message arrived in the foreground!', JSON.stringify(remoteMessage));

      // 3. Display the notification manually
      await notifee.displayNotification({
        title: remoteMessage.notification?.title || 'New Notification',
        body: remoteMessage.notification?.body || '',
        data: {
          type: String(remoteMessage.data?.type || ''),
          targetUrl: String(remoteMessage.data?.targetUrl || ''),
          orderId: String(remoteMessage.data?.orderId || ''),
          message: String(remoteMessage.notification?.body || ''),
          title: String(remoteMessage.notification?.title || ''),
        },
        android: {
          channelId: 'default',
          importance: AndroidImportance.HIGH,
          pressAction: {
            id: 'default',
          },
        },
      });

      // 2. NEW: Refresh the Redux store instantly!
      // This grabs the current user's token and triggers your GET_NOTIFICATIONS action.
      const currentToken = store.getState().authentication.data?.token;
      if (currentToken) {
        store.dispatch({ type: 'GET_NOTIFICATIONS' });
      }
    });

    const unsubscribeOpened = onNotificationOpenedApp(messagingInstance, remoteMessage => {
      if (remoteMessage) {
        maybeHandleOrderMessage(remoteMessage);
      }
    });

    getInitialNotification(messagingInstance).then(remoteMessage => {
      if (remoteMessage) {
        maybeHandleOrderMessage(remoteMessage);
      }
    });

    return () => {
      unsubscribe();
      unsubscribeOpened();
    }; // Cleanup listeners on unmount
  }, []);

  return (
    <SafeAreaProvider initialMetrics={initialWindowMetrics}>
      <AppearanceProvider>
        <Provider store={store}>
          <PersistGate loading={null} persistor={persistor}>
            <AppErrorBoundary>
              <View style={{ flex: 1 }}>
                <NetworkBanner />
                <AppNavigation />
                <Toast config={toastConfig} />
              </View>
            </AppErrorBoundary>
          </PersistGate>
        </Provider>
      </AppearanceProvider>
    </SafeAreaProvider>
  );
};

export default App;