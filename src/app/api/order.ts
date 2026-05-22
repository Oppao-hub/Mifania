import { getRequest, postRequest } from './client';

export const getOrdersApi = async (token: string) => {
    const response = await getRequest<any>("/orders", token);
    return response['member'] || response['hydra:member'] || [];
};

export const getOrderDetailsApi = async (idOrIri: string | number, token: string) => {
    const endpoint = typeof idOrIri === 'string' && idOrIri.startsWith('/api') 
        ? idOrIri 
        : `/orders/${idOrIri}`;
    return await getRequest<any>(endpoint, token);
};

export const createOrderApi = async (orderData: any, token: string) => {
    return await postRequest<any>("/orders", orderData, token);
};
