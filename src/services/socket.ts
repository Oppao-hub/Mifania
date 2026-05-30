import { io, Socket } from 'socket.io-client';
import { SOCKET_URL } from '../config/realtime';
import type { RealtimeRefreshPayload } from '../utils/realtimeRefresh';
import { dispatchRealtimeRefresh } from '../utils/realtimeDispatch';
import { upsertNotificationFromSocket } from '../utils/notificationInbox';
import { presentLocalNotification } from './localNotifications';
import { scheduleOrderNotification } from './orderNotificationCoordinator';

let socket: Socket | null = null;
let isSocketConnected = false;
const connectionListeners = new Set<(connected: boolean) => void>();

function setSocketConnectedState(connected: boolean) {
  if (isSocketConnected === connected) {
    return;
  }
  isSocketConnected = connected;
  connectionListeners.forEach((listener) => listener(connected));
}

export function getSocketConnected(): boolean {
  return isSocketConnected;
}

export function subscribeSocketConnection(
  listener: (connected: boolean) => void,
): () => void {
  connectionListeners.add(listener);
  listener(isSocketConnected);
  return () => connectionListeners.delete(listener);
}

function normalizeEntity(entity?: string): string {
  return String(entity || '').toLowerCase();
}

/** Always refresh Redux data first — this must never be gated by notification permission. */
function refreshLiveData(payload: RealtimeRefreshPayload): void {
  dispatchRealtimeRefresh(payload);
}

function scheduleOrderBanner(data: {
  notificationId?: string | number;
  title?: string;
  message?: string;
  orderId?: string | number;
  orderReference?: string;
  targetUrl?: string;
  status?: string;
  action?: string;
}): void {
  upsertNotificationFromSocket({
    notificationId: data.notificationId,
    title: data.title || 'Order Status Updated',
    message: data.message,
    orderId: data.orderId,
    orderReference: data.orderReference,
    targetUrl: data.targetUrl,
    type: 'order',
    status: data.status || data.action,
  });

  scheduleOrderNotification({
    notificationId: data.notificationId,
    title: data.title || 'Order Status Updated',
    message: data.message,
    orderId: data.orderId,
    orderReference: data.orderReference,
    targetUrl: data.targetUrl,
    status: data.status || data.action,
    skipInboxRefresh: true,
  });
}

export const setupSocket = (authToken: string, userId: string | number) => {
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
  }
  setSocketConnectedState(false);

  socket = io(SOCKET_URL, {
    path: '/socket.io',
    auth: { userId: String(userId), token: String(userId) },
    transports: ['websocket', 'polling'],
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 2000,
  });

  socket.on('connect', () => {
    setSocketConnectedState(true);
    console.log('Socket connected:', socket?.id, 'user', userId);
    refreshLiveData({ entity: 'bootstrap', action: 'connected' });
  });

  socket.on('disconnect', () => {
    setSocketConnectedState(false);
  });

  socket.on('connect_error', (err) => {
    setSocketConnectedState(false);
    console.log('Socket connection error:', err.message);
    if (err.message.includes('401') || err.message.includes('Unauthorized')) {
      socket?.disconnect();
    }
  });

  socket.on('dashboard_refresh', (data: RealtimeRefreshPayload) => {
    if (__DEV__) {
      console.log('[socket] dashboard_refresh', data);
    }
    refreshLiveData(data);

    if (normalizeEntity(data.entity).includes('order')) {
      scheduleOrderBanner(data);
    }
  });

  socket.on('notification', (data: any) => {
    refreshLiveData({
      entity: data?.type || 'system',
      orderId: data?.orderId,
      entityId: data?.entityId,
      action: 'changed',
    });

    if (String(data?.type || '').toLowerCase().includes('order')) {
      scheduleOrderBanner(data);
      return;
    }

    upsertNotificationFromSocket({
      notificationId: data?.notificationId,
      title: data?.title,
      message: data?.message,
      type: data?.type,
      targetUrl: data?.targetUrl,
      orderId: data?.orderId,
      orderReference: data?.orderReference,
    });

    void presentLocalNotification({
      ...data,
      type: data?.type || 'system',
      title: data?.title || 'Notification',
      skipInboxRefresh: true,
    });
  });

  socket.on('new_order', (data: any) => {
    refreshLiveData({ entity: 'order', orderId: data?.orderId, action: 'created' });
    scheduleOrderBanner({
      ...data,
      title: data?.title || 'New Order Received!',
      message: data?.message,
    });
  });

  socket.on('order_status_update', (data: any) => {
    refreshLiveData({
      entity: 'order',
      orderId: data?.orderId,
      action: data?.status === 'deleted' ? 'deleted' : 'updated',
    });
    scheduleOrderBanner(data);
  });

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
    setSocketConnectedState(false);
    console.log('Socket disconnected');
  }
};

export { shouldDisplayPushNotification } from './localNotifications';
