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
import { presentLocalNotification } from './src/services/localNotifications';
import { scheduleOrderNotification } from './src/services/orderNotificationCoordinator';
import { upsertNotificationFromSocket } from './src/utils/notificationInbox';
import { initializePushNotifications } from './src/services/pushNotifications';
import { dispatchRealtimeRefresh } from './src/utils/realtimeDispatch';

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

    void initializePushNotifications().then((granted) => {
      if (!granted) {
        console.warn('[push] Notification permission was not granted at startup.');
      }
    });

    const unsubscribe = onMessage(messagingInstance, async remoteMessage => {
      console.log('[push] Foreground FCM message:', remoteMessage?.messageId || 'no-id');

      const data = remoteMessage.data || {};
      const type = String(data.type || '');
      const orderId = data.orderId != null ? String(data.orderId) : undefined;
      const orderReference = data.orderReference != null ? String(data.orderReference) : undefined;
      const targetUrl = data.targetUrl != null ? String(data.targetUrl) : '';

      if (type.toLowerCase().includes('order') && orderId) {
        dispatchRealtimeRefresh({
          entity: 'order',
          orderId,
          action: 'updated',
        });
      } else if (store.getState().authentication.data?.token) {
        store.dispatch({ type: 'GET_NOTIFICATIONS' });
      }

      const pushTitle = remoteMessage.notification?.title || String(data.title || 'New Notification');
      const pushBody = remoteMessage.notification?.body || String(data.message || '');

      if (type.toLowerCase().includes('order') && orderId) {
        upsertNotificationFromSocket({
          title: pushTitle,
          message: pushBody,
          orderId,
          orderReference,
          targetUrl,
          type: 'order',
        });
        scheduleOrderNotification({
          title: pushTitle,
          message: pushBody,
          orderId,
          orderReference,
          targetUrl,
          skipInboxRefresh: true,
        });
        return;
      }

      upsertNotificationFromSocket({
        title: pushTitle,
        message: pushBody,
        type: type || 'system',
        targetUrl,
        orderId,
        orderReference,
      });

      await presentLocalNotification({
        type,
        orderId,
        orderReference,
        title: pushTitle,
        message: pushBody,
        targetUrl,
        skipInboxRefresh: true,
      });
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