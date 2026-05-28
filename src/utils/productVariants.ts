import { Color, Product, Size } from './types';

/** Short labels for size chips (backend stores full enum values). */
export const SIZE_OPTIONS: { value: Size; label: string }[] = [
  { value: Size.EXTRA_SMALL, label: 'XS' },
  { value: Size.SMALL, label: 'S' },
  { value: Size.MEDIUM, label: 'M' },
  { value: Size.LARGE, label: 'L' },
  { value: Size.EXTRA_LARGE, label: 'XL' },
  { value: Size.DOUBLE_EXTRA_LARGE, label: 'XXL' },
  { value: Size.TRIPLE_EXTRA_LARGE, label: 'XXXL' },
  { value: Size.NA, label: 'N/A' },
];

/** Matches App\Entity\Enum\Color::getHexCode() on the backend. */
export const COLOR_OPTIONS: { value: Color; label: string; hex: string }[] = [
  { value: Color.BLUE, label: 'Blue', hex: '#0000FF' },
  { value: Color.GREEN, label: 'Green', hex: '#008000' },
  { value: Color.BLACK, label: 'Black', hex: '#000000' },
  { value: Color.WHITE, label: 'White', hex: '#FFFFFF' },
  { value: Color.BROWN, label: 'Brown', hex: '#A52A2A' },
  { value: Color.MOCHA, label: 'Mocha', hex: '#C8B085' },
  { value: Color.BEIGE, label: 'Beige', hex: '#F5F5DC' },
];

export const getColorHex = (color?: string | Color | null): string => {
  if (!color) return '#9CA3AF';
  const match = COLOR_OPTIONS.find((c) => c.value === color);
  return match?.hex ?? '#9CA3AF';
};

export const getSizeLabel = (size?: string | Size | null): string => {
  if (!size) return 'N/A';
  const match = SIZE_OPTIONS.find((s) => s.value === size);
  return match?.label ?? size;
};

export const normalizeProductSize = (size?: string | Size | null): Size | null => {
  if (!size) return null;
  const match = SIZE_OPTIONS.find((s) => s.value === size || s.label === size);
  return match?.value ?? (size as Size);
};

export const normalizeProductColor = (color?: string | Color | null): Color | null => {
  if (!color) return null;
  const match = COLOR_OPTIONS.find((c) => c.value === color || c.label === color);
  return match?.value ?? (color as Color);
};

export const getProductStock = (product?: Product | null): number => {
  if (!product) return 0;
  const stockField = (product as Product & { stock?: number }).stock;
  if (typeof stockField === 'number') return stockField;
  if (Array.isArray(product.stocks) && product.stocks.length > 0) {
    return product.stocks.reduce(
      (sum: number, s: { quantity?: number }) => sum + (s.quantity ?? 0),
      0,
    );
  }
  return 0;
};

/** Find another catalog product with the same name but different size/color. */
export const findProductVariant = (
  products: Product[],
  baseProduct: Product,
  size: Size,
  color: Color,
): Product | undefined =>
  products.find(
    (p) =>
      p.id !== baseProduct.id &&
      p.name === baseProduct.name &&
      p.size === size &&
      p.color === color,
  );
