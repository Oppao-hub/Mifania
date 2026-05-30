import { Product } from './types';

export type CatalogSortOption = 'newest' | 'price_asc' | 'price_desc' | 'name_asc';

export const CATALOG_SORT_OPTIONS: { value: CatalogSortOption; label: string }[] = [
  { value: 'newest', label: 'Newest' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'name_asc', label: 'Name: A–Z' },
];

export const sortProductsByPriceAsc = (products: Product[]): Product[] =>
  [...products].sort(
    (a, b) => parseFloat(a.price || '0') - parseFloat(b.price || '0'),
  );

export const sortProductsByName = (products: Product[]): Product[] =>
  [...products].sort((a, b) => a.name.localeCompare(b.name));

export const applyCatalogSort = (
  products: Product[],
  sort: CatalogSortOption,
): Product[] => {
  switch (sort) {
    case 'price_asc':
      return sortProductsByPriceAsc(products);
    case 'price_desc':
      return [...products].sort(
        (a, b) => parseFloat(b.price || '0') - parseFloat(a.price || '0'),
      );
    case 'name_asc':
      return sortProductsByName(products);
    case 'newest':
    default:
      return [...products].sort((a, b) => {
        const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return bTime - aTime;
      });
  }
};
