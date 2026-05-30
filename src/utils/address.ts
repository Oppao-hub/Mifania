import { CustomerAddress } from './types';

export const formatDisplayPhone = (phone?: string): string => {
    const value = phone?.trim();
    if (!value) return '( no contact number )';
    if (value.startsWith('(')) return value;
    return `( ${value} )`;
};

export const formatAddressLine = (address: CustomerAddress): string => {
    if (address.formattedAddress) return address.formattedAddress;
    return [address.address, address.city, address.state, address.postalCode, address.country]
        .filter(Boolean)
        .join(', ');
};

export const getAddressRecipientName = (address: CustomerAddress): string => {
    if (address.recipientFullName) return address.recipientFullName;
    const parts = [address.recipientFirstName, address.recipientLastName].filter(Boolean);
    return parts.join(' ') || 'Customer';
};

export const getAddressId = (address: CustomerAddress): string => {
    if (address.id != null) return String(address.id);
    if (address['@id']) {
        const segments = address['@id'].split('/');
        return segments[segments.length - 1] || address['@id'];
    }
    return '';
};

export const getAddressIri = (address: CustomerAddress | string | number): string => {
    if (typeof address === 'string' && address.startsWith('/')) return address;
    if (typeof address === 'object' && address['@id']) return address['@id'];
    const id = typeof address === 'object' ? address.id : address;
    return `/api/customer_addresses/${id}`;
};

export const hasDeliverableAddress = (
    addresses: CustomerAddress[],
    customerAddress?: string,
    customerContact?: string,
): boolean => {
    const hasSaved = addresses.some((item) => Boolean(item.address?.trim()));
    const hasLegacy = Boolean(customerAddress?.trim() && customerContact?.trim());
    return hasSaved || hasLegacy;
};
