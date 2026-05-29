import { getRequest, postRequest } from './client';
import { resolveResourceId } from '../../utils/apiResource';
import type { ProductReview } from '../../utils/types';

const unwrapCollection = <T>(data: Record<string, unknown>): T[] => {
  const member = data['hydra:member'] ?? data.member;
  return Array.isArray(member) ? (member as T[]) : [];
};

const mapReview = (raw: Record<string, unknown>): ProductReview => ({
  '@id': typeof raw['@id'] === 'string' ? raw['@id'] : undefined,
  id: typeof raw.id === 'number' ? raw.id : undefined,
  rating: Number(raw.rating) || 0,
  comment: typeof raw.comment === 'string' ? raw.comment : undefined,
  reviewerName: typeof raw.reviewerName === 'string' ? raw.reviewerName : undefined,
  createdAt: typeof raw.createdAt === 'string' ? raw.createdAt : undefined,
  orderId: resolveResourceId(raw.order as string | number) ?? undefined,
  productId: resolveResourceId(raw.product as string | number) ?? undefined,
});

export const fetchProductReviewsApi = async (
  productId: number,
  token?: string,
): Promise<ProductReview[]> => {
  const data = await getRequest<Record<string, unknown>>(
    `/product_reviews?product=/api/products/${productId}`,
    token,
  );
  return unwrapCollection<Record<string, unknown>>(data).map(mapReview);
};

export const fetchOrderReviewsApi = async (
  orderId: number,
  token: string,
): Promise<ProductReview[]> => {
  const data = await getRequest<Record<string, unknown>>(
    `/product_reviews?order=/api/orders/${orderId}`,
    token,
  );
  return unwrapCollection<Record<string, unknown>>(data).map(mapReview);
};

export const submitProductReviewApi = async (
  token: string,
  payload: {
    orderId: number;
    productId: number;
    rating: number;
    comment: string;
  },
): Promise<ProductReview> => {
  const raw = await postRequest<Record<string, unknown>>(
    '/product_reviews',
    {
      order: `/api/orders/${payload.orderId}`,
      product: `/api/products/${payload.productId}`,
      rating: payload.rating,
      comment: payload.comment.trim() || null,
    },
    token,
  );
  return mapReview(raw);
};
