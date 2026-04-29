import { getRequest } from './client';

export const fetchCategories = () => getRequest('/categories');