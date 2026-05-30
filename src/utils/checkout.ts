import { CartItem } from './types';
import { PaymentMethods, PaymentMethodType } from '../constants/Payment';

export const CHECKOUT_SERVICE_FEE = 1.5;
export const CHECKOUT_TAX = 3.5;

export const getSelectedCartItems = (items: CartItem[]): CartItem[] =>
    items.filter((item) => item.selected);

export const parseCurrencyAmount = (value?: string | number): number => {
    if (typeof value === 'number') return value;
    if (!value) return 0;
    const normalized = String(value).replace(/[^0-9.-]/g, '');
    const parsed = parseFloat(normalized);
    return Number.isNaN(parsed) ? 0 : parsed;
};

export const calculateCheckoutTotals = (selectedItems: CartItem[], deliveryFee: number = 0) => {
    const subtotal = selectedItems.reduce(
        (sum, item) => sum + parseFloat(item.price || '0') * item.quantity,
        0,
    );
    const serviceFee = selectedItems.length > 0 ? CHECKOUT_SERVICE_FEE : 0;
    const tax = selectedItems.length > 0 ? CHECKOUT_TAX : 0;
    const normalizedDeliveryFee = selectedItems.length > 0 ? Math.max(0, deliveryFee) : 0;
    const total = subtotal + serviceFee + normalizedDeliveryFee + tax;
    const itemCount = selectedItems.reduce((sum, item) => sum + item.quantity, 0);

    return {
        subtotal,
        serviceFee,
        deliveryFee: normalizedDeliveryFee,
        tax,
        total,
        itemCount,
        subtotalFormatted: subtotal.toFixed(2),
        serviceFeeFormatted: serviceFee.toFixed(2),
        deliveryFeeFormatted: normalizedDeliveryFee.toFixed(2),
        taxFormatted: tax.toFixed(2),
        totalFormatted: total.toFixed(2),
    };
};

export interface CheckoutSnapshot {
    items: CartItem[];
    totals: ReturnType<typeof calculateCheckoutTotals>;
}

/**
 * @param totalAmount Checkout total BEFORE loyalty points are applied.
 * The backend OrderProcessor deducts pointsRedeemed from this amount.
 */
export const buildOrderPayload = (
    selectedItems: CartItem[],
    paymentMethod: PaymentMethodType,
    totalAmount: string,
    pointsRedeemed: number = 0,
    shipping?: { method: string; fee: string },
    customerAddressIri?: string,
) => ({
    totalAmount: String(totalAmount),
    paymentMethod,
    paymentStatus:
        paymentMethod === PaymentMethods.PAYPAL || paymentMethod === PaymentMethods.WALLET
            ? 'Paid'
            : 'Pending',
    orderStatus: 'Pending',
    pointsRedeemed: Math.max(0, Math.floor(pointsRedeemed)),
    ...(shipping
        ? {
              shippingMethod: shipping.method,
              shippingFee: shipping.fee,
          }
        : {}),
    ...(customerAddressIri ? { customerAddress: customerAddressIri } : {}),
    orderItems: selectedItems.map((item) => {
        const rawPrice = item.price || '0';
        const price = Number.isNaN(parseFloat(rawPrice))
            ? '0.00'
            : parseFloat(rawPrice).toFixed(2);

        const qty = Number.isNaN(parseInt(String(item.quantity || '1'), 10))
            ? 1
            : parseInt(String(item.quantity), 10);

        const subtotal = (parseFloat(price) * qty).toFixed(2);

        const productIri =
            typeof item.product === 'string'
                ? item.product
                : item.product?.['@id'] ||
                  `/api/products/${item.product?.id || item.product}`;

        return {
            product: productIri,
            quantity: qty,
            price: String(price),
            subtotal: String(subtotal),
        };
    }),
});
