import { resolveResourceId } from './apiResource';
import type { Order, OrderItem, Product } from './types';

export interface ReorderLineItem {
  productId: number;
  quantity: number;
}

export const resolveProductFromOrderItem = (
  item: OrderItem | string,
): Product | null => {
  if (typeof item === 'string') return null;
  const productRef = item.product;
  if (productRef && typeof productRef === 'object') {
    return productRef;
  }
  return null;
};

export const getReorderLineItems = (order: Order | null | undefined): ReorderLineItem[] => {
  if (!order?.orderItems?.length) return [];

  const lines: ReorderLineItem[] = [];

  for (const rawItem of order.orderItems) {
    if (typeof rawItem === 'string') continue;

    const productId = resolveResourceId(rawItem.product);
    if (productId == null) continue;

    const quantity = Math.max(1, Number(rawItem.quantity) || 1);
    lines.push({ productId, quantity });
  }

  return lines;
};

export const getOrderItemProductIds = (order: Order | null | undefined): number[] => {
  if (!order?.orderItems?.length) return [];

  const ids: number[] = [];
  const seen = new Set<number>();

  for (const rawItem of order.orderItems) {
    if (typeof rawItem === 'string') continue;

    const embedded = resolveProductFromOrderItem(rawItem);
    const productId = embedded?.id ?? resolveResourceId(rawItem.product);
    if (productId == null || seen.has(productId)) continue;

    seen.add(productId);
    ids.push(productId);
  }

  return ids;
};
