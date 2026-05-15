import { getRequest, postRequest } from './client';

export const getOrdersApi = async (token: string) => {
    const response = await getRequest<any>("/orders", token);
    return response['hydra:member'] || [];
};

export const createOrderApi = async (orderData: any, token: string) => {
    return await postRequest<any>("/orders", orderData, token);
};
