import { Product } from './types';

export type ProductVoucher = {
  id: string;
  title: string;
  code: string;
  minSpend: number;
  expiresLabel: string;
};

export const FEATURED_PRODUCT_VOUCHERS: ProductVoucher[] = [
  {
    id: 'mifania20',
    title: 'Best Deal: 20% Off',
    code: 'MIFANIA20',
    minSpend: 1500,
    expiresLabel: 'Valid until Dec 31',
  },
  {
    id: 'eco15',
    title: 'Eco Picks: 15% Off',
    code: 'ECO15',
    minSpend: 1000,
    expiresLabel: 'Valid until Nov 30',
  },
  {
    id: 'ship',
    title: 'Free Shipping',
    code: 'FREESHIP',
    minSpend: 2500,
    expiresLabel: 'Min. spend ₱2,500',
  },
];

export const getRelatedProducts = (
  products: Product[],
  current: Product,
  limit = 8,
): Product[] => {
  const currentSub =
    typeof current.subCategory === 'object'
      ? current.subCategory?.id
      : current.subCategory;

  return products
    .filter((p) => {
      if (p.id === current.id) return false;
      const sub =
        typeof p.subCategory === 'object' ? p.subCategory?.id : p.subCategory;
      if (currentSub && sub) return sub === currentSub;
      return p.name.split(' ')[0] === current.name.split(' ')[0];
    })
    .slice(0, limit);
};

export const buildProductSpecs = (params: {
  material?: string;
  size?: string;
  color?: string;
  slug?: string;
  sku?: string | number;
}): { label: string; value: string }[] => {
  const rows: { label: string; value: string }[] = [];
  if (params.material) rows.push({ label: 'Material', value: params.material });
  if (params.size) rows.push({ label: 'Size', value: params.size });
  if (params.color) rows.push({ label: 'Color', value: params.color });
  if (params.slug) rows.push({ label: 'SKU', value: String(params.sku ?? params.slug) });
  rows.push({ label: 'Care Label', value: 'Machine washable, cold gentle cycle' });
  return rows;
};
