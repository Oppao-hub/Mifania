import { Notification } from './types';

export type NotificationTab = 'General' | 'Promotions';

export const isPromotionNotification = (notification: Notification): boolean => {
  const type = String(notification.type || '').toLowerCase();
  return type === 'promotion' || type === 'promo';
};

export const filterNotificationsByTab = (
  notifications: Notification[],
  tab: NotificationTab,
): Notification[] =>
  notifications.filter((item) =>
    tab === 'Promotions' ? isPromotionNotification(item) : !isPromotionNotification(item),
  );

export const getNotificationIcon = (notification: Notification): string => {
  const type = String(notification.type || '').toLowerCase();
  const text = `${notification.title || ''} ${notification.message || ''}`.toLowerCase();

  if (type === 'order' || text.includes('order') || text.includes('shipped') || text.includes('delivered')) {
    return 'bag-outline';
  }
  if (type === 'security' || text.includes('security') || text.includes('login')) {
    return 'shield-checkmark-outline';
  }
  if (text.includes('password')) {
    return 'lock-closed-outline';
  }
  if (text.includes('update') || text.includes('system')) {
    return 'information-circle-outline';
  }
  if (text.includes('feature') || text.includes('launch')) {
    return 'star-outline';
  }
  if (text.includes('reminder') || text.includes('event')) {
    return 'calendar-outline';
  }
  if (isPromotionNotification(notification)) {
    return 'pricetag-outline';
  }
  if (text.includes('payment')) {
    return 'card-outline';
  }

  return 'notifications-outline';
};

export const getNotificationEmoji = (notification: Notification): string => {
  if (notification.emoji) {
    return notification.emoji;
  }

  const type = String(notification.type || '').toLowerCase();
  const text = `${notification.title || ''} ${notification.message || ''}`.toLowerCase();

  if (type === 'security' || text.includes('security') || text.includes('login')) return '🔒';
  if (text.includes('password')) return '✅';
  if (text.includes('update')) return '🔄';
  if (text.includes('feature') || text.includes('launch')) return '🆕';
  if (text.includes('reminder') || text.includes('event')) return '📅';
  if (type === 'order' || text.includes('order')) return '📦';
  if (isPromotionNotification(notification)) return '🏷️';
  if (text.includes('payment')) return '💳';

  return '';
};

export const formatNotificationTimestamp = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return dateString;
  }
};
