import { Product } from '../../utils/types';
import { getRequest, postRequest } from './client';

const parseWishlistCollection = (response: any): Product[] => {
    if (Array.isArray(response)) return response;
    return response?.member || response?.['hydra:member'] || [];
};

export const getWishlistApi = async (token: string): Promise<Product[]> => {
    const response = await getRequest<any>('/me/wishlist', token);
    return parseWishlistCollection(response);
};

export const toggleWishlistApi = async (
    productId: number | string,
    token: string,
): Promise<{ added: boolean; product: Product }> => {
    return await postRequest<{ added: boolean; product: Product }>(
        `/me/wishlist/${productId}/toggle`,
        {},
        token,
    );
};
