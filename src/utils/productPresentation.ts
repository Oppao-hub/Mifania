import { Product } from './types';

export const getProductRating = (product: Product): string => {
  const seed = Number(product.id) || product.name.length;
  const rating = 4.4 + (seed % 6) * 0.1;
  return rating.toFixed(1);
};
