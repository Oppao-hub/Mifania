import { getRequest } from './client';

export const fetchSubCategories = () => getRequest('/sub_categories');