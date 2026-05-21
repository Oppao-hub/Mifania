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

    if (response.status === 422) {
        // Specifically return the 'detail' property for validation errors like "Out of Stock"
        if (errorData.detail) {
            throw new Error(errorData.detail);
        } else if (errorData.violations && errorData.violations.length > 0) {
            throw new Error(errorData.violations[0].message);
        }
    }
    
    throw new Error(errorData.message || errorData['hydra:description'] || errorData.detail || `Error: ${response.status}. Request Failed`);
};

export const postRequest = async <T>(endpoint: string, body: object, token?: string): Promise<T> => {
    const headers = getHeaders(token);
    console.log(`POST Request: ${BASE_URL}${endpoint}`, { headers });
    try {
        const response = await fetch(`${BASE_URL}${endpoint}`, {
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
    console.log(`PATCH Request: ${BASE_URL}${endpoint}`, { headers });
    try {
        const response = await fetch(`${BASE_URL}${endpoint}`, {
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
    console.log(`DELETE Request: ${BASE_URL}${endpoint}`, { headers });
    try {
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
    } catch (error: any) {
        if (error instanceof TypeError && error.message === 'Network request failed') {
            throw new Error("Network Error: Could not connect to the server.");
        }
        throw error;
    }
};

export const getRequest = async <T>(endpoint: string, token?: string): Promise<T> => {
    const headers = getHeaders(token);
    console.log(`GET Request: ${BASE_URL}${endpoint}`, { headers });
    try {
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
    } catch (error: any) {
        if (error instanceof TypeError && error.message === 'Network request failed') {
            throw new Error("Network Error: Could not connect to the server.");
        }
        throw error;
    }
};
