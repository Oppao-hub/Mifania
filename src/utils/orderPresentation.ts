import { Order } from './types';

export type OrderListTab = 'Active' | 'Completed' | 'Cancelled';

export const normalizeOrderStatus = (status: string | undefined | null): string => {
  const value = String(status || '').toLowerCase();
  return value === 'canceled' ? 'cancelled' : value;
};

export const isActiveOrderStatus = (status: string | undefined | null): boolean => {
  const normalized = normalizeOrderStatus(status);
  return normalized === 'pending' || normalized === 'processing' || normalized === 'shipped';
};

export const isCompletedOrderStatus = (status: string | undefined | null): boolean =>
  normalizeOrderStatus(status) === 'delivered';

export const isCancelledOrderStatus = (status: string | undefined | null): boolean =>
  normalizeOrderStatus(status) === 'cancelled';

export const filterOrdersByTab = (orders: Order[], tab: OrderListTab): Order[] =>
  orders.filter((order) => {
    if (tab === 'Active') return isActiveOrderStatus(order.orderStatus);
    if (tab === 'Completed') return isCompletedOrderStatus(order.orderStatus);
    return isCancelledOrderStatus(order.orderStatus);
  });

export const sortOrdersByNewest = (orders: Order[]): Order[] =>
  [...orders].sort((a, b) => {
    const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    if (timeB !== timeA) return timeB - timeA;
    return (b.id ?? 0) - (a.id ?? 0);
  });

export const formatOrderListDate = (createdAt?: string): string => {
  if (!createdAt) return 'Order Date Unavailable';

  const date = new Date(createdAt);
  if (Number.isNaN(date.getTime())) return 'Order Date Unavailable';

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const orderDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffDays = Math.floor((today.getTime() - orderDay.getTime()) / (1000 * 60 * 60 * 24));

  const formatted = date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  if (diffDays === 0) return `Today, ${formatted}`;
  if (diffDays === 1) return `Yesterday, ${formatted}`;
  return formatted;
};

export const getOtherProductsLabel = (itemCount: number): string | null => {
  const others = Math.max(0, itemCount - 1);
  if (others === 0) return null;
  return others === 1 ? '+1 other product' : `+${others} other products`;
};

export const canCancelOrderStatus = (status: string | undefined | null): boolean => {
  const normalized = normalizeOrderStatus(status);
  return normalized === 'pending' || normalized === 'processing';
};
