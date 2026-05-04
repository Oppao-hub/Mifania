import { Platform } from 'react-native';

export const ASSET_URL: string = Platform.OS === 'android' 
    ? "http://10.0.2.2:8000" 
    : "http://localhost:8000";

const BASE_URL: string = `${ASSET_URL}/api`;

const sharedHeaders = {
    "Accept": "application/json",
    "Content-Type": "application/json"
};

export const postRequest = async <T>(endpoint: string, body: object): Promise<T> => {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
        method: "POST",
        headers: sharedHeaders,
        body: JSON.stringify(body)
    });

    if(!response.ok){
        const errorData = await response.json().catch(() => ({})); 
        throw new Error(errorData.message || `Error: ${response.status}. Request Failed`);
    }

    return await response.json();
};

export const getRequest = async <T>(endpoint: string): Promise<T> => {
    console.log(`GET Request: ${BASE_URL}${endpoint}`);
    const response = await fetch(`${BASE_URL}${endpoint}`, {
        method: "GET",
        headers: { "Accept": "application/json" }
    });

    if(!response.ok){
        const errorData = await response.json().catch(() => ({})); 
        console.error(`GET Error: ${response.status}`, errorData);
        throw new Error(errorData.message || `Error: ${response.status}. Request Failed`);
    }

    const data = await response.json();
    console.log(`GET Success: ${endpoint}`, JSON.stringify(data).substring(0, 200));
    return data;
};