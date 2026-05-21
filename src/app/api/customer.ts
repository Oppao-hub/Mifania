import { Customer } from '../../utils/types';
import { getRequest, patchRequest } from './client';

export const getCustomerApi = async (id: number, token: string) => {
    return await getRequest<Customer>(`/customers/${id}`, token);
};

export const updateCustomerApi = async (id: number, data: Partial<Customer>, token: string) => {
    return await patchRequest<Customer>(`/customers/${id}`, data, token);
};
