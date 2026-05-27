/**
 * @format
 */

import { AppRegistry } from 'react-native';
import notifee, { EventType } from '@notifee/react-native';
import messaging from '@react-native-firebase/messaging'; // 💡 ADDED IMPORT
import App from './App';
import { name as appName } from './app.json';
//@ts-ignore
import "./global.css"

// 💡 ADDED: Firebase Background Handler
messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log('Message handled in the background!', remoteMessage);
  // Note: If your backend sends a "notification" payload, Android system handles displaying it automatically.
  // If it sends a "data-only" payload, you would use notifee.displayNotification here.
});

// Background event handler for notifications (Notifee)
notifee.onBackgroundEvent(async ({ type, detail }) => {
  const { notification, pressAction } = detail;

  // Check if the user pressed the notification
  if (type === EventType.PRESS && pressAction?.id === 'default') {
    console.log('User pressed notification in background', notification);
    // You could perform navigation or other logic here
  }
});

AppRegistry.registerComponent(appName, () => App);