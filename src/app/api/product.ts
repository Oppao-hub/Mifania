import { getRequest } from './client';

export const fetchProducts = () => getRequest('/products');

const PEXELS_API_KEY = "eF50CjkcE7IjVDEu5Dz1L7dxuRmESlQTRTiSoAN6QD2HhpblamC03TBZ";
const PEXELS_API_URL = `https://api.pexels.com/v1/search?query=fashion&orientation=portrait&size=small&per_page=10`;

export const fetchPexelsImages = async (query = 'fashion') => {
    try {
        const url = `https://api.pexels.com/v1/search?query=${query}&orientation=portrait&size=small&per_page=10`;
        const response = await fetch(url, {
            headers: {
                Authorization: PEXELS_API_KEY
            }
        });
        return await response.json();
    } catch (error) {
        console.error("Pexels API Error:", error);
        throw error;
    }
};