import { presentOrderStatusNotification } from './localNotifications';

export type OrderNotificationPayload = {
  notificationId?: string | number;
  title?: string;
  message?: string;
  orderId?: string | number;
  orderReference?: string;
  targetUrl?: string;
  status?: string;
  skipInboxRefresh?: boolean;
};

let pendingPayload: OrderNotificationPayload | null = null;
let flushTimer: ReturnType<typeof setTimeout> | null = null;

function payloadScore(payload: OrderNotificationPayload): number {
  let score = 0;
  if (payload.notificationId != null) score += 4;
  if (payload.message?.trim()) score += 2;
  if (payload.orderReference) score += 1;
  if (payload.title?.trim()) score += 1;
  return score;
}

function mergePayload(
  current: OrderNotificationPayload | null,
  incoming: OrderNotificationPayload,
): OrderNotificationPayload {
  if (!current) {
    return incoming;
  }

  if (payloadScore(incoming) >= payloadScore(current)) {
    return { ...current, ...incoming };
  }

  return { ...incoming, ...current };
}

/** Coalesce burst socket/FCM events for the same order update into one banner. */
export function scheduleOrderNotification(payload: OrderNotificationPayload): void {
  if (
    !payload.message?.trim()
    && payload.notificationId == null
    && payload.orderId == null
    && !payload.status?.trim()
  ) {
    return;
  }

  pendingPayload = mergePayload(pendingPayload, payload);

  if (flushTimer) {
    clearTimeout(flushTimer);
  }

  flushTimer = setTimeout(() => {
    flushTimer = null;
    const nextPayload = pendingPayload;
    pendingPayload = null;
    if (!nextPayload) {
      return;
    }

    void presentOrderStatusNotification(nextPayload);
  }, 120);
}
