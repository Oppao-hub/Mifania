import { ASSET_URL, getRequest } from '../app/api/client';

export type DeliveryOption = {
    id: string;
    name: string;
    estimate: string;
    fee: string;
    logo?: string;
};

export type PaymentOption = {
    id: string;
    name: string;
    logo?: string;
    backendMethod: 'Paypal' | 'Credit Card' | 'Cash' | 'Bank Transfer';
    gatewayType: 'paypal' | 'direct';
};

const DEFAULT_DELIVERY_OPTIONS: DeliveryOption[] = [
    {
        id: 'fedex',
        name: 'FedEx Express',
        estimate: 'Estimated arrival: 23 - 24 Dec, 2024',
        fee: '₱8.50',
    },
    {
        id: 'usps',
        name: '(USPS) United States Postal Service',
        estimate: 'Estimated arrival: 24 - 25 Dec, 2024',
        fee: '₱9.00',
    },
];

const DEFAULT_PAYMENT_OPTIONS: PaymentOption[] = [
    {
        id: 'paypal',
        name: 'PayPal',
        backendMethod: 'Paypal',
        gatewayType: 'paypal',
    },
    {
        id: 'credit-card',
        name: 'Credit Card',
        backendMethod: 'Credit Card',
        gatewayType: 'direct',
    },
];

const DELIVERY_ENDPOINT_CANDIDATES = [
    '/delivery-options',
    '/delivery_options',
    '/shipping-options',
    '/shipping_options',
    '/shipping-methods',
    '/shipping_methods',
    '/carriers',
];

const PAYMENT_ENDPOINT_CANDIDATES = [
    '/payment-gateways',
    '/payment_gateways',
    '/payment-options',
    '/payment_options',
    '/payment-methods',
    '/payment_methods',
];

const cache = {
    deliveryEndpoint: '' as string,
    paymentEndpoint: '' as string,
    deliveryOptions: null as DeliveryOption[] | null,
    paymentOptions: null as PaymentOption[] | null,
};

const buildApiUrl = (endpoint: string): string => {
    if (endpoint.startsWith('http')) return endpoint;
    if (endpoint.startsWith('/api')) return `${ASSET_URL}${endpoint}`;
    return `${ASSET_URL}/api${endpoint}`;
};

const quietGetRequest = async <T>(endpoint: string, token: string): Promise<T> => {
    const response = await fetch(buildApiUrl(endpoint), {
        method: 'GET',
        headers: {
            Accept: 'application/ld+json',
            'Content-Type': 'application/ld+json',
            Authorization: `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
    }

    return response.json();
};

const normalizeCollection = (data: any): any[] => {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.['hydra:member'])) return data['hydra:member'];
    if (Array.isArray(data?.member)) return data.member;
    if (Array.isArray(data?.items)) return data.items;
    return [];
};

const mapDeliveryOption = (item: any, index: number): DeliveryOption => {
    const name = item?.name || item?.label || item?.title || item?.provider || `Delivery ${index + 1}`;
    const estimate = item?.estimate || item?.estimatedArrival || item?.eta || 'Estimated arrival unavailable';
    const rawFee = item?.fee ?? item?.price ?? item?.cost ?? 0;
    const fee = typeof rawFee === 'number' ? `₱${rawFee.toFixed(2)}` : String(rawFee || '₱0.00');

    return {
        id: String(item?.id || item?.slug || item?.code || item?.['@id'] || `delivery-${index + 1}`),
        name,
        estimate,
        fee,
        logo: item?.logo || item?.icon || item?.imageUrl,
    };
};

const inferBackendMethod = (name: string): PaymentOption['backendMethod'] => {
    const value = name.toLowerCase();
    if (value.includes('paypal')) return 'Paypal';
    if (value.includes('cash')) return 'Cash';
    if (value.includes('bank')) return 'Bank Transfer';
    return 'Credit Card';
};

const mapPaymentOption = (item: any, index: number): PaymentOption => {
    const name = item?.name || item?.label || item?.title || `Payment ${index + 1}`;
    const backendMethod = (item?.backendMethod as PaymentOption['backendMethod']) || inferBackendMethod(name);
    const gatewayType =
        String(item?.gatewayType || '').toLowerCase() === 'paypal' || name.toLowerCase().includes('paypal')
            ? 'paypal'
            : 'direct';

    return {
        id: String(item?.id || item?.slug || item?.code || item?.['@id'] || `payment-${index + 1}`),
        name,
        logo: item?.logo || item?.icon || item?.imageUrl,
        backendMethod,
        gatewayType,
    };
};

const tryCollectionEndpoints = async (
    candidates: string[],
    token: string,
    preferredEndpoint?: string,
): Promise<{ items: any[]; endpoint: string } | null> => {
    if (preferredEndpoint) {
        try {
            const response = await quietGetRequest<any>(preferredEndpoint, token);
            const collection = normalizeCollection(response);
            if (collection.length > 0) {
                return { items: collection, endpoint: preferredEndpoint };
            }
        } catch {
            // Fall through to candidate list.
        }
    }

    for (const endpoint of candidates) {
        try {
            const response = await quietGetRequest<any>(endpoint, token);
            const collection = normalizeCollection(response);
            if (collection.length > 0) {
                return { items: collection, endpoint };
            }
        } catch {
            // Try next endpoint candidate.
        }
    }
    return null;
};

export const fetchDeliveryOptions = async (token: string): Promise<DeliveryOption[]> => {
    if (cache.deliveryOptions) return cache.deliveryOptions;
    const found = await tryCollectionEndpoints(DELIVERY_ENDPOINT_CANDIDATES, token, cache.deliveryEndpoint);
    if (!found) {
        cache.deliveryOptions = DEFAULT_DELIVERY_OPTIONS;
        return cache.deliveryOptions;
    }
    cache.deliveryEndpoint = found.endpoint;
    cache.deliveryOptions = found.items.map(mapDeliveryOption);
    return cache.deliveryOptions;
};

export const fetchPaymentOptions = async (token: string): Promise<PaymentOption[]> => {
    if (cache.paymentOptions) return cache.paymentOptions;
    const found = await tryCollectionEndpoints(PAYMENT_ENDPOINT_CANDIDATES, token, cache.paymentEndpoint);
    if (found) {
        cache.paymentEndpoint = found.endpoint;
        cache.paymentOptions = found.items.map(mapPaymentOption);
        return cache.paymentOptions;
    }

    // Fallback to known enum-like values if dedicated endpoint does not exist.
    try {
        const maybeOrder = await getRequest<any>('/orders', token);
        const first = normalizeCollection(maybeOrder)[0];
        if (first?.paymentMethod) {
            const method = String(first.paymentMethod);
            cache.paymentOptions = [
                {
                    id: method.toLowerCase().replace(/\s+/g, '-'),
                    name: method,
                    backendMethod: inferBackendMethod(method),
                    gatewayType: method.toLowerCase().includes('paypal') ? 'paypal' : 'direct',
                },
            ];
            return cache.paymentOptions;
        }
    } catch {
        // Use defaults below.
    }

    cache.paymentOptions = DEFAULT_PAYMENT_OPTIONS;
    return cache.paymentOptions;
};

