import notifee, { AndroidImportance } from '@notifee/react-native';
import { showFeedbackToast } from '../utils/feedbackToast';
import { dispatchSocketAction } from '../utils/realtimeDispatch';
import * as Types from '../app/actions';
import { ensureNotificationChannel, ensureNotificationPermission } from './pushNotifications';

const orderNotificationLabel = (data: { orderReference?: string; orderId?: string | number }) =>
  data.orderReference || (data.orderId != null ? String(data.orderId) : 'your order');

export const resolveOrderNotificationMessage = (data: {
  message?: string;
  orderReference?: string;
  orderId?: string | number;
  status?: string;
  fallback?: string;
}) => {
  const label = orderNotificationLabel(data);
  const message = data.message?.trim();

  if (message) {
    if (data.orderReference && data.orderId != null) {
      const orderId = String(data.orderId);
      const reference = data.orderReference;
      const rewritten = message
        .replace(new RegExp(`order\\s*#?${orderId}\\b`, 'gi'), `Order ${reference}`)
        .replace(new RegExp(`#${orderId}\\b`, 'g'), reference);
      if (rewritten !== message) {
        return rewritten;
      }
    }
    return message;
  }

  if (data.status) {
    return `Order ${label} is now ${data.status}.`;
  }

  return data.fallback || `Order ${label} was updated.`;
};

const recentNotificationKeys = new Set<string>();
const inFlightNotificationKeys = new Set<string>();

export function buildNotificationDedupeKey(data: {
  notificationId?: string | number;
  title?: string;
  orderId?: string | number;
  type?: string;
  message?: string;
}): string {
  if (data.notificationId != null) {
    return `id:${data.notificationId}`;
  }

  const orderId = data.orderId != null ? String(data.orderId) : '';
  const message = String(data.message || '').trim().toLowerCase();
  if (orderId && message) {
    return `order:${orderId}:${message}`;
  }

  return [
    data.type || 'system',
    orderId,
    String(data.title || '').toLowerCase(),
    message,
  ].join('|');
}

function markNotificationDisplayed(key: string): void {
  recentNotificationKeys.add(key);
  setTimeout(() => recentNotificationKeys.delete(key), 15000);
}

export function shouldDisplayPushNotification(data: {
  notificationId?: string | number;
  title?: string;
  orderId?: string | number;
  type?: string;
  message?: string;
}): boolean {
  const key = buildNotificationDedupeKey(data);
  return !recentNotificationKeys.has(key) && !inFlightNotificationKeys.has(key);
}

export async function presentLocalNotification(data: {
  notificationId?: string | number;
  title?: string;
  message?: string;
  orderId?: string | number;
  orderReference?: string;
  type?: string;
  targetUrl?: string;
  status?: string;
  skipInboxRefresh?: boolean;
}): Promise<boolean> {
  const dedupeKey = buildNotificationDedupeKey(data);
  if (recentNotificationKeys.has(dedupeKey) || inFlightNotificationKeys.has(dedupeKey)) {
    if (__DEV__) {
      console.log('[push] Skipped duplicate notification:', dedupeKey);
    }
    return false;
  }

  inFlightNotificationKeys.add(dedupeKey);

  try {
    const resolvedOrderId = Number(data.orderId);
    const isOrderEvent = String(data.type || '').toLowerCase().includes('order');
    const targetUrl =
      data.targetUrl ||
      (isOrderEvent && !Number.isNaN(resolvedOrderId) && resolvedOrderId > 0
        ? `/orders/${resolvedOrderId}`
        : undefined);

    const resolvedTitle = data.title?.trim() || (isOrderEvent ? 'Order Status Updated' : 'Notification');
    const resolvedMessage = isOrderEvent
      ? resolveOrderNotificationMessage(data)
      : data.message?.trim() || '';

    if (!resolvedMessage && !resolvedTitle) {
      console.warn('[push] Skipped notification with empty title and body.');
      return false;
    }

    if (!data.skipInboxRefresh) {
      dispatchSocketAction(Types.GET_NOTIFICATIONS);
    }

    const notificationText = `${resolvedTitle} ${resolvedMessage}`.toLowerCase();
    if (
      notificationText.includes('cancel') &&
      (String(data.type || '').toLowerCase().includes('order') || notificationText.includes('order'))
    ) {
      showFeedbackToast('Order Cancelled');
    }

    const permitted = await ensureNotificationPermission();
    if (!permitted) {
      console.warn('[push] Notification permission not granted; banner not shown.');
      const fallbackText = resolvedMessage
        ? `${resolvedTitle}: ${resolvedMessage}`
        : resolvedTitle;
      if (fallbackText.trim()) {
        showFeedbackToast(fallbackText);
      }
      return false;
    }

    await ensureNotificationChannel();

    await notifee.displayNotification({
      title: resolvedTitle,
      body: resolvedMessage,
      data: {
        type: String(data.type || ''),
        targetUrl: String(targetUrl || ''),
        orderId: !Number.isNaN(resolvedOrderId) && resolvedOrderId > 0 ? String(resolvedOrderId) : '',
        message: String(resolvedMessage || ''),
        title: String(resolvedTitle || ''),
      },
      android: {
        channelId: 'default',
        importance: AndroidImportance.HIGH,
        smallIcon: 'ic_stat_notification',
        pressAction: { id: 'default' },
      },
    });

    markNotificationDisplayed(dedupeKey);
    console.log('[push] Displayed notification:', resolvedTitle);
    return true;
  } catch (error) {
    console.error('[push] Failed to display local notification:', error);
    return false;
  } finally {
    inFlightNotificationKeys.delete(dedupeKey);
  }
}

export async function presentOrderStatusNotification(data: {
  notificationId?: string | number;
  title?: string;
  message?: string;
  orderId?: string | number;
  orderReference?: string;
  targetUrl?: string;
  status?: string;
  skipInboxRefresh?: boolean;
}): Promise<boolean> {
  return presentLocalNotification({
    ...data,
    type: 'order',
    title: data.title || 'Order Status Updated',
  });
}
