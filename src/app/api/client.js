import { Platform } from 'react-native';

const BASE_URL = Platform.select({
    android: "http://10.0.2.2:8000/api",
    default: "http://127.0.0.1:8000/api",
});

const sharedHeaders = {
    "Accept": "application/json",
    "Content-Type": "application/json"
};

export const postRequest = async (endpoint, body) => {
    return await fetch(`${BASE_URL}${endpoint}`, {
        method: "POST",
        headers: sharedHeaders,
        body: JSON.stringify(body)
    });
};

export const getRequest = async (endpoint) => {
    console.log("Fetching from:", `${BASE_URL}${endpoint}`);
    return await fetch(`${BASE_URL}${endpoint}`, {
        method: "GET",
        headers: { "Accept": "application/json" }
    });
};


const PEXELS_API_KEY = "eF50CjkcE7IjVDEu5Dz1L7dxuRmESlQTRTiSoAN6QD2HhpblamC03TBZ";
const API_URL = `https://api.pexels.com/v1/search?query=fashion&orientation=portrait&size=small&per_page=10`;

export const fetchPexelsImages = async () => {
    try{
        const response = await fetch(API_URL, {
            headers: {
                Authorization: PEXELS_API_KEY
            }
        })
        return await response.json();
    } catch (error) {
        console.error("Pexels API Error:", error);
        throw error;
    }
}