import { PaymentMethods } from '../constants/Payment';
import { PaymentOption } from './checkoutOptions';

export type CheckoutPaymentVisual =
    | { type: 'image'; source: number }
    | { type: 'svg'; uri: string }
    | { type: 'icon'; name: string; color: string };

const SIMPLE_ICON = (slug: string) => `https://cdn.simpleicons.org/${slug}`;

export const getCheckoutPaymentVisual = (option: PaymentOption): CheckoutPaymentVisual => {
    if (option.logo) {
        return { type: 'svg', uri: option.logo };
    }

    switch (option.backendMethod) {
        case PaymentMethods.WALLET:
            return { type: 'image', source: require('../assets/logos/logo.png') };
        case PaymentMethods.PAYPAL:
            return { type: 'svg', uri: SIMPLE_ICON('paypal') };
        case PaymentMethods.CREDIT_CARD:
            return { type: 'svg', uri: SIMPLE_ICON('mastercard') };
        case PaymentMethods.CASH:
            return { type: 'icon', name: 'cash', color: '#16A34A' };
        case PaymentMethods.BANK_TRANSFER:
            return { type: 'icon', name: 'business', color: '#2563EB' };
        default: {
            const key = `${option.id} ${option.name}`.toLowerCase();
            if (key.includes('paypal')) {
                return { type: 'svg', uri: SIMPLE_ICON('paypal') };
            }
            if (key.includes('wallet')) {
                return { type: 'image', source: require('../assets/logos/logo.png') };
            }
            if (key.includes('cash')) {
                return { type: 'icon', name: 'cash', color: '#16A34A' };
            }
            if (key.includes('bank')) {
                return { type: 'icon', name: 'business', color: '#2563EB' };
            }
            return { type: 'icon', name: 'card', color: '#1A1F71' };
        }
    }
};
