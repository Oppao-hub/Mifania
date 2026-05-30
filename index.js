/**
 * @format
 */

import { AppRegistry } from 'react-native';
import notifee, { EventType } from '@notifee/react-native';
import { getApp } from '@react-native-firebase/app';
import { getMessaging, setBackgroundMessageHandler } from '@react-native-firebase/messaging';
import App from './App';
import { name as appName } from './app.json';
import './src/app/store';
import { presentLocalNotification } from './src/services/localNotifications';
import { scheduleOrderNotification } from './src/services/orderNotificationCoordinator';
import { upsertNotificationFromSocket } from './src/utils/notificationInbox';
import { dispatchRealtimeRefresh } from './src/utils/realtimeDispatch';
//@ts-ignore
import "./global.css"

const messagingInstance = getMessaging(getApp());

setBackgroundMessageHandler(messagingInstance, async remoteMessage => {
  console.log('[push] Background FCM message:', remoteMessage?.messageId || 'no-id');

  const data = remoteMessage.data || {};
  const type = String(data.type || '');
  const orderId = data.orderId;

  if (type.toLowerCase().includes('order') && orderId) {
    dispatchRealtimeRefresh({
      entity: 'order',
      orderId,
      action: 'updated',
    });
  }

  // When FCM includes a notification payload, Android/iOS already show it in the tray.
  if (remoteMessage.notification) {
    return;
  }

  const title = data.title || 'New Notification';
  const body = data.message || '';

  if (!title && !body) {
    return;
  }

  if (type.toLowerCase().includes('order') && orderId) {
    upsertNotificationFromSocket({
      title: String(title),
      message: String(body),
      orderId,
      orderReference: data.orderReference,
      targetUrl: String(data.targetUrl || ''),
      type: 'order',
    });
    scheduleOrderNotification({
      title: String(title),
      message: String(body),
      orderId,
      orderReference: data.orderReference,
      targetUrl: String(data.targetUrl || ''),
      skipInboxRefresh: true,
    });
    return;
  }

  upsertNotificationFromSocket({
    title: String(title),
    message: String(body),
    type: type || 'system',
    targetUrl: String(data.targetUrl || ''),
  });

  await presentLocalNotification({
    type,
    orderId,
    orderReference: data.orderReference,
    title: String(title),
    message: String(body),
    targetUrl: String(data.targetUrl || ''),
    skipInboxRefresh: true,
  });
});

notifee.onBackgroundEvent(async ({ type, detail }) => {
  const { notification, pressAction } = detail;

  if (type === EventType.PRESS && pressAction?.id === 'default') {
    console.log('[push] User pressed notification in background', notification?.id);
  }
});

AppRegistry.registerComponent(appName, () => App);
