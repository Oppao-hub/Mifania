import { Platform } from 'react-native';

export const ASSET_URL: string = Platform.OS === 'android' 
    ? "http://10.0.2.2:8000" // Use 10.0.2.2 for Android Emulator to reach host loopback
    : "http://localhost:8000"; // Use localhost for iOS Simulator or physical devices on same network (via IP)

const BASE_URL: string = `${ASSET_URL}/api`;

const getHeaders = (token?: string) => {
    const headers: any = {
        "Accept": "application/json",
        "Content-Type": "application/json"
    };
    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }
    return headers;
};

const handleResponseError = async (response: Response) => {
    let errorData: any = {};
    try {
        errorData = await response.json();
    } catch {
        // ignore parse error
    }

    if (response.status === 422) {
        // Return detailed validation errors if available (Symfony/API Platform format)
        if (errorData.violations && errorData.violations.length > 0) {
            throw new Error(errorData.violations[0].message);
        } else if (errorData.detail) {
            throw new Error(errorData.detail);
        }
    }
    
    throw new Error(errorData.message || errorData.detail || `Error: ${response.status}. Request Failed`);
};

export const postRequest = async <T>(endpoint: string, body: object, token?: string): Promise<T> => {
    const headers = getHeaders(token);
    console.log(`POST Request: ${BASE_URL}${endpoint}`, { headers });
    const response = await fetch(`${BASE_URL}${endpoint}`, {
        method: "POST",
        headers: headers,
        body: JSON.stringify(body)
    });

    if(!response.ok) {
        await handleResponseError(response);
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

    if(!response.ok) {
        await handleResponseError(response);
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

    if(!response.ok) {
        await handleResponseError(response);
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

    if(!response.ok) {
        console.error(`GET Error: ${response.status}`);
        await handleResponseError(response);
    }

    const data = await response.json();
    console.log(`GET Success: ${endpoint}`, JSON.stringify(data).substring(0, 200));
    return data;
};
