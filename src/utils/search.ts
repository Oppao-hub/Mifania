import { Product } from './types';

export const searchProducts = (products: Product[], query: string): Product[] => {
  const term = query.trim().toLowerCase();
  if (!term) return products;

  return products.filter((product) => {
    const haystack = [product.name, product.description, product.material, product.slug]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();
    return haystack.includes(term);
  });
};
