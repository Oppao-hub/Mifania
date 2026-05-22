export const ASSET_URL: string = "https://sflmifania-production.up.railway.app";

const BASE_URL: string = `${ASSET_URL}/api`;

const getHeaders = (token?: string) => {
    const headers: any = {
        "Accept": "application/ld+json",
        "Content-Type": "application/ld+json"
    };
    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }
    return headers;
};

const handleResponseError = async (response: Response) => {
    let errorData: any = {};
    const text = await response.text();
    try {
        errorData = JSON.parse(text);
    } catch {
        errorData = { detail: text };
    }

    console.log("❌ Server Error Response:", JSON.stringify(errorData, null, 2));

    if (response.status === 401) {
        throw new Error("Unauthorized");
    }

    if (response.status === 422) {
        // Handle API Platform violations array
        if (errorData.violations && errorData.violations.length > 0) {
            throw new Error(errorData.violations[0].message);
        }
        // Fallback to detail
        if (errorData.detail) {
            throw new Error(errorData.detail);
        }
    }
    
    throw new Error(errorData.message || errorData['hydra:description'] || errorData.detail || `Error: ${response.status}. Request Failed`);
};

const buildUrl = (endpoint: string): string => {
    // If endpoint already starts with http, return it (external or full URL)
    if (endpoint.startsWith('http')) return endpoint;
    
    // If endpoint already starts with '/api', append it to ASSET_URL
    if (endpoint.startsWith('/api')) return `${ASSET_URL}${endpoint}`;
    
    // Otherwise append to BASE_URL (which includes /api)
    return `${BASE_URL}${endpoint}`;
};

export const postRequest = async <T>(endpoint: string, body: object, token?: string): Promise<T> => {
    const headers = getHeaders(token);
    const url = buildUrl(endpoint);
    console.log(`POST Request: ${url}`, { headers });
    try {
        const response = await fetch(url, {
            method: "POST",
            headers: headers,
            body: JSON.stringify(body)
        });

        if(!response.ok) {
            await handleResponseError(response);
        }

        return await response.json();
    } catch (error: any) {
        if (error instanceof TypeError && error.message === 'Network request failed') {
            throw new Error("Network Error: Could not connect to the server. Please check your internet connection.");
        }
        throw error;
    }
};

export const patchRequest = async <T>(endpoint: string, body: object, token?: string): Promise<T> => {
    const headers = {
        ...getHeaders(token),
        "Content-Type": "application/merge-patch+json"
    };
    const url = buildUrl(endpoint);
    console.log(`PATCH Request: ${url}`, { headers });
    try {
        const response = await fetch(url, {
            method: "PATCH",
            headers: headers,
            body: JSON.stringify(body)
        });

        if(!response.ok) {
            await handleResponseError(response);
        }

        return await response.json();
    } catch (error: any) {
        if (error instanceof TypeError && error.message === 'Network request failed') {
            throw new Error("Network Error: Could not connect to the server.");
        }
        throw error;
    }
};

export const deleteRequest = async <T>(endpoint: string, token?: string): Promise<T> => {
    const headers = getHeaders(token);
    const url = buildUrl(endpoint);
    console.log(`DELETE Request: ${url}`, { headers });
    try {
        const response = await fetch(url, {
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
    } catch (error: any) {
        if (error instanceof TypeError && error.message === 'Network request failed') {
            throw new Error("Network Error: Could not connect to the server.");
        }
        throw error;
    }
};

export const getRequest = async <T>(endpoint: string, token?: string): Promise<T> => {
    const headers = getHeaders(token);
    const url = buildUrl(endpoint);
    console.log(`GET Request: ${url}`, { headers });
    try {
        const response = await fetch(url, {
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
    } catch (error: any) {
        if (error instanceof TypeError && error.message === 'Network request failed') {
            throw new Error("Network Error: Could not connect to the server.");
        }
        throw error;
    }
};
