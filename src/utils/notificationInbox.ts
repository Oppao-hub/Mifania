import * as Types from '../app/actions';
import type { Notification } from './types';
import { dispatchSocketAction } from './realtimeDispatch';

export type SocketNotificationPayload = {
  notificationId?: string | number;
  title?: string;
  message?: string;
  type?: string;
  targetUrl?: string;
  orderId?: string | number;
  orderReference?: string;
  status?: string;
  isRead?: boolean;
  createdAt?: string;
};

export function buildInboxNotificationFromSocket(data: SocketNotificationPayload): Notification {
  const orderId = data.orderId != null ? Number(data.orderId) : undefined;
  const resolvedType = String(data.type || '').toLowerCase().includes('order')
    ? 'order'
    : String(data.type || 'system');

  return {
    id: data.notificationId != null ? Number(data.notificationId) : undefined,
    title: data.title?.trim() || (resolvedType === 'order' ? 'Order Status Updated' : 'Notification'),
    message: data.message?.trim() || (data.status ? `Status: ${data.status}` : ''),
    type: resolvedType,
    isRead: data.isRead ?? false,
    targetUrl: data.targetUrl,
    createdAt: data.createdAt || new Date().toISOString(),
    ...(orderId && !Number.isNaN(orderId) ? { orderId } : {}),
  } as Notification;
}

/** Keep the inbox in sync immediately when socket/FCM payloads arrive. */
export function upsertNotificationFromSocket(data: SocketNotificationPayload): void {
  const item = buildInboxNotificationFromSocket(data);
  if (!item.title && !item.message) {
    return;
  }

  dispatchSocketAction(Types.ADD_NOTIFICATION, item);
}

export function refreshNotificationInbox(): void {
  dispatchSocketAction(Types.GET_NOTIFICATIONS);
}
