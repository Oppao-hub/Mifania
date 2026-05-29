import { CustomerAddress } from '../../utils/types';
import { deleteRequest, getRequest, patchRequest, postRequest } from './client';

const parseAddressCollection = (response: any): CustomerAddress[] => {
    if (Array.isArray(response)) return response;
    return response?.member || response?.['hydra:member'] || [];
};

export const getAddressesApi = async (token: string): Promise<CustomerAddress[]> => {
    const response = await getRequest<any>('/me/addresses', token);
    return parseAddressCollection(response);
};

export const createAddressApi = async (data: Partial<CustomerAddress>, token: string) => {
    return await postRequest<CustomerAddress>('/customer_addresses', data, token);
};

export const updateAddressApi = async (
    addressId: number | string,
    data: Partial<CustomerAddress>,
    token: string,
) => {
    return await patchRequest<CustomerAddress>(`/customer_addresses/${addressId}`, data, token);
};

export const deleteAddressApi = async (addressId: number | string, token: string) => {
    return await deleteRequest(`/customer_addresses/${addressId}`, token);
};
