export const PaymentMethods = {
    CASH: 'Cash',
    PAYPAL: 'Paypal',
    CREDIT_CARD: 'Credit Card',
    BANK_TRANSFER: 'Bank Transfer',
    WALLET: 'Wallet',
};

export const PaymentStatuses = {
    PENDING: 'Pending',
    PAID: 'Paid',
    REFUNDED: 'Refunded',
    FAILED: 'Failed',
};

export const OrderStatuses = {
    PENDING: 'Pending',
    PROCESSING: 'Processing',
    SHIPPED: 'Shipped',
    DELIVERED: 'Delivered',
    CANCELLED: 'Cancelled',
    COMPLETED: 'Completed',
};

export type PaymentMethodType = typeof PaymentMethods[keyof typeof PaymentMethods];
export type PaymentStatusType = typeof PaymentStatuses[keyof typeof PaymentStatuses];
export type OrderStatusType = typeof OrderStatuses[keyof typeof OrderStatuses];
