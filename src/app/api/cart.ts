import { getRequest, postRequest, patchRequest, deleteRequest } from './client';

export const getCartApi = async (token: string) => {
    return await getRequest("/me/cart", token);
};

export const getCollectionsApi = async (token: string) => {
    return await getRequest("/me/carts", token);
};

export const createCollectionApi = async (name: string, token: string) => {
    return await postRequest("/carts", { name }, token);
};

export const switchCollectionApi = async (cartId: number | string, token: string) => {
    return await patchRequest(`/carts/${cartId}`, { isMain: true }, token);
};

export const deleteCollectionApi = async (cartId: number | string, token: string) => {
    return await deleteRequest(`/carts/${cartId}`, token);
};

export const addToCartApi = async (productId: number | string, quantity: number, token: string) => {
    // API Platform expects IRI for relations, e.g., "/api/products/1"
    const body = {
        product: `/api/products/${productId}`,
        quantity: quantity
    };
    return await postRequest("/cart_items", body, token);
};

export const updateCartItemApi = async (cartItemId: number | string, quantity: number, token: string) => {
    return await patchRequest(`/cart_items/${cartItemId}`, { quantity }, token);
};

export const deleteCartItemApi = async (cartItemId: number | string, token: string) => {
    return await deleteRequest(`/cart_items/${cartItemId}`, token);
};
