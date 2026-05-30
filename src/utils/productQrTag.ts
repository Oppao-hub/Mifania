import { Linking } from 'react-native';
import { ASSET_URL } from '../app/api/client';
import { ROUTES } from './routes';
import { Product, Story } from './types';

export interface ProductQrTagInfo {
  linkUrl: string | null;
  imageUrl: string | null;
  /** True only when the product has an assigned QR tag with scan data or image */
  hasQrCode: boolean;
}

const emptyQrInfo = (): ProductQrTagInfo => ({
  linkUrl: null,
  imageUrl: null,
  hasQrCode: false,
});

const resolveQrImageUrl = (qrTag: Record<string, unknown>): string | null => {
  const imagePath =
    (typeof qrTag.imageUrl === 'string' && qrTag.imageUrl) ||
    (typeof qrTag.image === 'string' && qrTag.image) ||
    (typeof qrTag.qrImagePath === 'string' && qrTag.qrImagePath
      ? `/uploads/qrcodes/${qrTag.qrImagePath}`
      : null);

  return resolveAssetUrl(imagePath);
};

const resolveAssetUrl = (url?: string | null): string | null => {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  const separator = url.startsWith('/') ? '' : '/';
  return `${ASSET_URL}${separator}${url}`;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

export const resolveProductStory = (product?: Product | null): Story | null => {
  if (!product?.story || typeof product.story === 'string') return null;
  return product.story;
};

export const resolveProductJourneyUrl = (product?: Product | null): string | null => {
  if (!product?.slug) return null;
  return `${ASSET_URL}/shop/journey/${product.slug}`;
};

export const getProductQrTagInfo = (product?: Product | null): ProductQrTagInfo => {
  const qrTag = product?.qrTag;

  if (!qrTag || (Array.isArray(qrTag) && qrTag.length === 0)) {
    return emptyQrInfo();
  }

  // API returned an IRI only — QR payload was not embedded
  if (typeof qrTag === 'string') {
    return emptyQrInfo();
  }

  if (!isRecord(qrTag)) {
    return emptyQrInfo();
  }

  const qrCodeValue =
    typeof qrTag.qrCodeValue === 'string' && qrTag.qrCodeValue.trim().length > 0
      ? qrTag.qrCodeValue.trim()
      : null;

  const imageUrl = resolveQrImageUrl(qrTag);
  const hasQrCode = Boolean(qrCodeValue || imageUrl);

  if (!hasQrCode) {
    return emptyQrInfo();
  }

  return {
    linkUrl: qrCodeValue ?? resolveProductJourneyUrl(product),
    imageUrl,
    hasQrCode: true,
  };
};

export const openProductSustainability = async (
  product?: Product | null,
  navigation?: { navigate: (screen: string, params?: object) => void },
): Promise<boolean> => {
  const story = resolveProductStory(product);

  if (story && navigation) {
    navigation.navigate(ROUTES.SUSTAINABILITY_STORY, { product, story });
    return true;
  }

  const journeyUrl = getProductQrTagInfo(product).linkUrl ?? resolveProductJourneyUrl(product);
  if (!journeyUrl) return false;

  const supported = await Linking.canOpenURL(journeyUrl);
  if (!supported) return false;

  await Linking.openURL(journeyUrl);
  return true;
};
