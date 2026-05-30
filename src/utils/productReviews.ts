import {
  fetchOrderReviewsApi,
  fetchProductReviewsApi,
  submitProductReviewApi,
} from '../app/api/review';
import type { ProductReview } from './types';

export type { ProductReview };

export const getProductReviews = (productId: number, token?: string): Promise<ProductReview[]> =>
  fetchProductReviewsApi(productId, token);

export const getOrderProductReviews = (orderId: number, token: string): Promise<ProductReview[]> =>
  fetchOrderReviewsApi(orderId, token);

export const getOrderProductReview = async (
  orderId: number,
  productId: number,
  token: string,
): Promise<ProductReview | null> => {
  const reviews = await fetchOrderReviewsApi(orderId, token);
  return reviews.find((review) => review.productId === productId) ?? null;
};

export const saveProductReview = (input: {
  orderId: number;
  productId: number;
  rating: number;
  comment: string;
  token: string;
}): Promise<ProductReview> =>
  submitProductReviewApi(input.token, {
    orderId: input.orderId,
    productId: input.productId,
    rating: input.rating,
    comment: input.comment,
  });
