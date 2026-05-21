import { Platform } from 'react-native';
import { io, Socket } from 'socket.io-client';
import notifee, { AndroidImportance, AuthorizationStatus } from '@notifee/react-native';

// Use 10.0.2.2 for Android Emulator, otherwise use your machine's IP for physical devices
const SOCKET_URL = "http://sflmifania-production.up.railway.app";

export const setupSocket = (userId: string, onEvent?: (action: any) => void): Socket => {
  const socket = io(SOCKET_URL, {
    auth: { token: userId },
  });

  socket.on("connect", () => {
    console.log("✅ Socket connected:", socket.id);
  });

  socket.on("connect_error", (err) => {
    console.log("❌ Socket connection error:", err.message);
  });

  // Helper to trigger Redux and Native Notification
  const triggerNotification = async (data: any, type: string = 'system') => {
    const notificationItem = {
      id: data.id || Math.random().toString(36).substr(2, 9),
      title: data.title,
      message: data.message,
      body: data.message, 
      createdAt: new Date().toISOString(),
      isRead: false,
      type: data.type || type,
      targetUrl: data.targetUrl,
      icon: data.icon || 'bell-outline',
      emoji: data.emoji || '🔔'
    };

    if (onEvent) {
      onEvent({ type: 'ADD_NOTIFICATION', payload: notificationItem });
    }

    const settings = await notifee.requestPermission();
    if (settings.authorizationStatus < AuthorizationStatus.AUTHORIZED) return;

    const channelId = await notifee.createChannel({
      id: 'default',
      name: 'Default Channel',
      importance: AndroidImportance.HIGH,
    });

    await notifee.displayNotification({
      title: notificationItem.title,
      body: notificationItem.message,
      android: {
        channelId,
        smallIcon: 'ic_launcher', 
        pressAction: { id: 'default' },
      },
    });
  };

  // Listener for 'notification' event
  socket.on("notification", async (data: { title: string; message: string; type?: string; id?: number | string; targetUrl?: string }) => {
    console.log("🔔 Notification received via socket:", data);
    await triggerNotification(data);
  });

  // Listener for 'new_order'
  socket.on("new_order", async (data: { orderId: string }) => {
    await triggerNotification({
      title: 'New Order Received!',
      message: `Order #${data.orderId} is ready for processing.`,
      icon: 'package-variant-closed',
      emoji: '📦',
      type: 'order'
    });
  });

  // Listener for 'order_status_update'
  socket.on("order_status_update", async (data: { orderId: string, status: string }) => {
    console.log("📦 Order Status Updated:", data);
    
    // Trigger notification
    await triggerNotification({
      title: 'Order Status Updated',
      message: `Your order #${data.orderId} is now ${data.status}.`,
      icon: 'truck-delivery-outline',
      emoji: '🚚',
      type: 'order'
    });

    // Also tell Redux to refresh orders if onEvent is provided
    if (onEvent) {
      onEvent({ type: 'SOCKET_ORDER_UPDATE' });
    }
  });

  return socket;
};
