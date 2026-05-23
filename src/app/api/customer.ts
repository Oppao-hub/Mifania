import { Customer } from '../../utils/types';
import { resolveCustomerEndpoint } from '../../utils/apiResource';
import { getRequest, patchRequest } from './client';

export const getCustomerApi = async (customerRef: string | Customer | number, token: string) => {
    return await getRequest<Customer>(resolveCustomerEndpoint(customerRef), token);
};

export const updateCustomerApi = async (customerRef: string | Customer | number, data: Partial<Customer>, token: string) => {
    return await patchRequest<Customer>(resolveCustomerEndpoint(customerRef), data, token);
};
