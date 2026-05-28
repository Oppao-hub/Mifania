import { io, Socket } from 'socket.io-client';
import notifee, { AndroidImportance, AuthorizationStatus } from '@notifee/react-native';

const SOCKET_URL = 'https://web-socket-production-29ca.up.railway.app';

let socket: Socket | null = null;

export const setupSocket = (authToken: string, userId: string | number, onEvent?: (action: any) => void) => {
  // 1. Cleanup previous instance before creating a new one
  if (socket) {
    socket.disconnect();
  }

  // Server joins rooms as user_<numericId> (see socket-server/server.js + SocketIoPublisher)
  socket = io(SOCKET_URL, {
    path: '/socket.io',
    auth: { userId: String(userId), token: String(userId) },
    transports: ['websocket', 'polling'],
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 5000,
  });

  socket.on("connect", () => {
    console.log("✅ Socket connected:", socket?.id);
  });

  socket.on("connect_error", (err) => {
    console.log("❌ Socket connection error:", err.message);
    // If the server explicitly rejects the token, stop retrying
    if (err.message.includes("401") || err.message.includes("Unauthorized")) {
        socket?.disconnect();
    }
  });

  // Listener logic remains, just ensure we use the local 'socket' variable
  socket.on("notification", async (data: any) => {
    await triggerNotification(data, onEvent);
  });

  socket.on("new_order", async (data: any) => {
    await triggerNotification({
      ...data,
      title: 'New Order Received!',
      message: `Order #${data.orderId} is ready.`,
      icon: 'package-variant-closed',
      emoji: '📦',
      type: 'order'
    }, onEvent);
  });

  socket.on("order_status_update", async (data: any) => {
    await triggerNotification({
      ...data,
      title: 'Order Status Updated',
      message: `Order #${data.orderId} is now ${data.status}.`,
      icon: 'truck-delivery-outline',
      emoji: '🚚',
      type: 'order'
    }, onEvent);
    
    if (onEvent) onEvent({ type: 'SOCKET_ORDER_UPDATE' });
  });

  return socket;
};

// 2. Export a disconnect helper
export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
    console.log("🔌 Socket disconnected");
  }
};

// 3. Extracted triggerNotification to keep setupSocket clean
const triggerNotification = async (data: any, onEvent?: (action: any) => void) => {
  const resolvedOrderId = Number(data?.orderId);
  const isOrderEvent = String(data?.type || '').toLowerCase().includes('order');
  const targetUrl =
    data?.targetUrl ||
    (isOrderEvent && !Number.isNaN(resolvedOrderId) && resolvedOrderId > 0
      ? `/orders/${resolvedOrderId}`
      : undefined);

  const notificationPayload = {
    ...data,
    targetUrl,
  };

  if (onEvent) {
    onEvent({ type: 'ADD_NOTIFICATION', payload: notificationPayload });
  }

  const settings = await notifee.requestPermission();
  if (settings.authorizationStatus < AuthorizationStatus.AUTHORIZED) return;

  const channelId = await notifee.createChannel({
    id: 'default',
    name: 'Default Channel',
    importance: AndroidImportance.HIGH,
  });

  await notifee.displayNotification({
    title: data.title,
    body: data.message,
    data: {
      type: String(data?.type || ''),
      targetUrl: String(targetUrl || ''),
      orderId: !Number.isNaN(resolvedOrderId) && resolvedOrderId > 0 ? String(resolvedOrderId) : '',
      message: String(data?.message || ''),
      title: String(data?.title || ''),
    },
    android: {
      channelId,
      smallIcon: 'ic_launcher',
      pressAction: { id: 'default' },
    },
  });
};