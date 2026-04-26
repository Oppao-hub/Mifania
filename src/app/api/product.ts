import { getRequest } from './client';

export const fetchProducts = () => getRequest('/products');