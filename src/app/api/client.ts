import { Platform } from 'react-native';

export const ASSET_URL = Platform.select({
    android: "http://10.0.2.2:8000",
    default: "http://127.0.0.1:8000",
});

const BASE_URL = `${ASSET_URL}/api`;

const sharedHeaders = {
    "Accept": "application/json",
    "Content-Type": "application/json"
};

export const postRequest = async (endpoint: string, body: object) => {
    return await fetch(`${BASE_URL}${endpoint}`, {
        method: "POST",
        headers: sharedHeaders,
        body: JSON.stringify(body)
    });
};

export const getRequest = async (endpoint: string) => {
    console.log("Fetching from:", `${BASE_URL}${endpoint}`);
    return await fetch(`${BASE_URL}${endpoint}`, {
        method: "GET",
        headers: { "Accept": "application/json" }
    });
};