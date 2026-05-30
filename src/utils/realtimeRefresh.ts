export type RealtimeRefreshPayload = {
  entity?: string;
  action?: string;
  entityId?: string | number;
  orderId?: string | number;
  notificationId?: string | number;
  orderReference?: string;
  title?: string;
  message?: string;
  targetUrl?: string;
};
