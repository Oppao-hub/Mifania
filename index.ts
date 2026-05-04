/**
 * @format
 */

import { AppRegistry } from 'react-native';
import notifee, { EventType } from '@notifee/react-native';
import App from './App';
import { name as appName } from './app.json';
//@ts-ignore
import "./global.css"

// Background event handler for notifications
notifee.onBackgroundEvent(async ({ type, detail }) => {
  const { notification, pressAction } = detail;

  // Check if the user pressed the notification
  if (type === EventType.PRESS && pressAction?.id === 'default') {
    console.log('User pressed notification in background', notification);
    // You could perform navigation or other logic here
  }
});

AppRegistry.registerComponent(appName, () => App);
