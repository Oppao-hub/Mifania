import { Platform } from 'react-native';
import { io, Socket } from 'socket.io-client';
import notifee, { AndroidImportance, AuthorizationStatus } from '@notifee/react-native';

const SOCKET_URL = Platform.select({
    android: "http://10.0.2.2:3001",
    default: "http://127.0.0.1:3001",
}) || "http://127.0.0.1:3001";

export const setupSocket = (userId: string): Socket => {
  const socket = io(SOCKET_URL, {
    auth: { token: userId }
  });

  socket.on("connect", () => {
    console.log("✅ Socket connected:", socket.id);
  });

  socket.on("connect_error", (err) => {
    console.log("❌ Socket connection error:", err.message);
  });

  socket.on("new_order", async (data: { orderId: string }) => {
    console.log("🔔 New order received via socket:", data);
    
    // Request permissions (required for iOS and Android 13+)
    const settings = await notifee.requestPermission();
    if (settings.authorizationStatus < AuthorizationStatus.AUTHORIZED) {
      console.log('🚫 User declined notification permissions');
      return;
    }

    // 1. Create a notification channel (Android requirement)
    const channelId = await notifee.createChannel({
      id: 'orders',
      name: 'Order Notifications',
      importance: AndroidImportance.HIGH,
    });

    // 2. Display the local notification
    await notifee.displayNotification({
      title: 'New Order Received!',
      body: `Order #${data.orderId} is ready for processing.`,
      android: {
        channelId,
        smallIcon: 'ic_launcher', // Ensure this exists in your android/app/src/main/res/mipmap-*
        pressAction: { id: 'default' },
      },
    });
  });

  return socket;
};
