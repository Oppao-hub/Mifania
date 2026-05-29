import { Category, Product, SubCategory } from './types';

export const DISCOVER_CATEGORY: Category = {
  id: 'all',
  name: 'Discover',
  slug: 'all',
};

export const getProductSubCategory = (
  product: Product,
  subCategories: SubCategory[],
): SubCategory | undefined =>
  subCategories.find((sc) => `/api/sub_categories/${sc.id}` === product.subCategory);

export const getProductCategoryId = (
  product: Product,
  subCategories: SubCategory[],
): number | string | null => {
  const sub = getProductSubCategory(product, subCategories);
  const cat = typeof sub?.category === 'object' ? sub.category : null;
  return cat?.id ?? null;
};

export const filterProductsByCategory = (
  products: Product[],
  subCategories: SubCategory[],
  categoryId: number | string | null,
  subCategoryId: number | string | null,
  searchQuery: string,
): Product[] =>
  products.filter((product) => {
    const sub = getProductSubCategory(product, subCategories);
    const cat = typeof sub?.category === 'object' ? sub.category : null;

    const matchesCategory =
      !categoryId ||
      categoryId === 'all' ||
      cat?.id === categoryId;

    const matchesSubCategory =
      !subCategoryId || sub?.id == subCategoryId;

    const matchesSearch = product.name
      .toLowerCase()
      .includes(searchQuery.trim().toLowerCase());

    return matchesCategory && matchesSubCategory && matchesSearch;
  });

export const sortProductsByNewest = (products: Product[]): Product[] =>
  [...products].sort((a, b) => {
    const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return bTime - aTime;
  });

export const sortProductsByPriceDesc = (products: Product[]): Product[] =>
  [...products].sort(
    (a, b) => parseFloat(b.price || '0') - parseFloat(a.price || '0'),
  );

export const getCategoryPreviewImage = (
  categoryId: number | string,
  products: Product[],
  subCategories: SubCategory[],
): string | undefined => {
  const match = products.find(
    (p) => getProductCategoryId(p, subCategories) === categoryId,
  );
  return match?.imageUrl || match?.image;
};
