import { SavedPaymentMethod, SavedPaymentProviderType } from './types';

export const formatCardNumberInput = (value: string): string => {
  const digits = value.replace(/\D/g, '').slice(0, 19);
  return digits.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
};

export const parseCardDigits = (value: string): string => value.replace(/\D/g, '');

export const detectCardBrand = (digits: string): string => {
  if (digits.startsWith('4')) return 'visa';
  if (/^5[1-5]/.test(digits) || /^2[2-7]/.test(digits)) return 'mastercard';
  if (/^3[47]/.test(digits)) return 'amex';
  if (digits.startsWith('35')) return 'jcb';
  return 'card';
};

export const getPaymentMethodIcon = (method: SavedPaymentMethod): string => {
  const provider = method.providerType;
  if (provider === 'paypal') return 'logo-paypal';
  if (provider === 'google_pay') return 'logo-google';
  if (provider === 'apple_pay') return 'logo-apple';
  if (method.cardBrand === 'visa') return 'card-outline';
  if (method.cardBrand === 'mastercard') return 'card-outline';
  if (method.cardBrand === 'amex') return 'card-outline';
  return 'card-outline';
};

export const getPaymentMethodIconColor = (method: SavedPaymentMethod): string => {
  if (method.providerType === 'paypal') return '#003087';
  if (method.providerType === 'google_pay') return '#4285F4';
  if (method.providerType === 'apple_pay') return '#111827';
  if (method.cardBrand === 'visa') return '#1A1F71';
  if (method.cardBrand === 'mastercard') return '#EB001B';
  if (method.cardBrand === 'amex') return '#006FCF';
  return '#6A7282';
};

export const getPaymentMethodSubtitle = (method: SavedPaymentMethod): string => {
  if (method.maskedNumber) return method.maskedNumber;
  if (method.providerType === 'card' && method.lastFour) {
    return `.... .... .... ${method.lastFour}`;
  }
  return method.displayName || 'Connected';
};

export const WALLET_CONNECT_OPTIONS: {
  providerType: SavedPaymentProviderType;
  label: string;
  icon: string;
  color: string;
}[] = [
  { providerType: 'paypal', label: 'PayPal', icon: 'logo-paypal', color: '#003087' },
  { providerType: 'google_pay', label: 'Google Pay', icon: 'logo-google', color: '#4285F4' },
  { providerType: 'apple_pay', label: 'Apple Pay', icon: 'logo-apple', color: '#111827' },
];

export const SUPPORTED_CARD_BRANDS = ['Mastercard', 'Visa', 'Amex', 'JCB'];
