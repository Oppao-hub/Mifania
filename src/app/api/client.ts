import { Platform } from 'react-native';

export const ASSET_URL: string = Platform.OS === 'android' 
    ? "http://10.0.2.2:8000" 
    : "http://localhost:8000";

const BASE_URL: string = `${ASSET_URL}/api`;

const getHeaders = (token?: string) => {
    const headers: any = {
        "Accept": "application/json",
        "Content-Type": "application/json"
    };
    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }
    return headers;
};

export const postRequest = async <T>(endpoint: string, body: object, token?: string): Promise<T> => {
    const headers = getHeaders(token);
    console.log(`POST Request: ${BASE_URL}${endpoint}`, { headers });
    const response = await fetch(`${BASE_URL}${endpoint}`, {
        method: "POST",
        headers: headers,
        body: JSON.stringify(body)
    });

    if(!response.ok){
        const errorData = await response.json().catch(() => ({})); 
        throw new Error(errorData.message || `Error: ${response.status}. Request Failed`);
    }

    return await response.json();
};

export const patchRequest = async <T>(endpoint: string, body: object, token?: string): Promise<T> => {
    const headers = {
        ...getHeaders(token),
        "Content-Type": "application/merge-patch+json"
    };
    console.log(`PATCH Request: ${BASE_URL}${endpoint}`, { headers });
    const response = await fetch(`${BASE_URL}${endpoint}`, {
        method: "PATCH",
        headers: headers,
        body: JSON.stringify(body)
    });

    if(!response.ok){
        const errorData = await response.json().catch(() => ({})); 
        throw new Error(errorData.message || `Error: ${response.status}. Request Failed`);
    }

    return await response.json();
};

export const deleteRequest = async <T>(endpoint: string, token?: string): Promise<T> => {
    const headers = getHeaders(token);
    console.log(`DELETE Request: ${BASE_URL}${endpoint}`, { headers });
    const response = await fetch(`${BASE_URL}${endpoint}`, {
        method: "DELETE",
        headers: headers
    });

    if(!response.ok){
        const errorData = await response.json().catch(() => ({})); 
        throw new Error(errorData.message || `Error: ${response.status}. Request Failed`);
    }

    if (response.status === 204) {
        return {} as T;
    }

    return await response.json();
};

export const getRequest = async <T>(endpoint: string, token?: string): Promise<T> => {
    const headers = getHeaders(token);
    console.log(`GET Request: ${BASE_URL}${endpoint}`, { headers });
    const response = await fetch(`${BASE_URL}${endpoint}`, {
        method: "GET",
        headers: headers
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
