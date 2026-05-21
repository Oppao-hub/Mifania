export const PaymentMethods = {
    CASH: 'Cash',
    PAYPAL: 'Paypal',
    CREDIT_CARD: 'Credit Card',
    BANK_TRANSFER: 'Bank Transfer',
};

export const PaymentStatuses = {
    PENDING: 'Pending',
    PAID: 'Paid',
    FAILED: 'Failed',
};

export const OrderStatuses = {
    PENDING: 'Pending',
    PROCESSING: 'Processing',
    COMPLETED: 'Completed',
};

export type PaymentMethodType = typeof PaymentMethods[keyof typeof PaymentMethods];
export type PaymentStatusType = typeof PaymentStatuses[keyof typeof PaymentStatuses];
export type OrderStatusType = typeof OrderStatuses[keyof typeof OrderStatuses];
