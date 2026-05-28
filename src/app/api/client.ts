export const ASSET_URL: string = 'https://sfl-mifania.up.railway.app';

const BASE_URL: string = `${ASSET_URL}/api`;

const FETCH_TIMEOUT_MS = 30000;

const fetchWithTimeout = async (url: string, options: RequestInit): Promise<Response> => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    try {
        return await fetch(url, { ...options, signal: controller.signal });
    } catch (error: unknown) {
        if (error instanceof Error && error.name === 'AbortError') {
            throw new Error('Request timed out. Check your connection and try again.');
        }
        throw error;
    } finally {
        clearTimeout(timeoutId);
    }
};

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
        throw new Error(errorData.message || errorData.error || "Unauthorized");
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

const isNetworkFailure = (error: unknown): boolean => {
    if (!(error instanceof TypeError)) {
        return false;
    }
    const message = error.message.toLowerCase();
    return (
        message.includes('network request failed') ||
        message.includes('failed to fetch') ||
        message.includes('network error')
    );
};

const mapFetchNetworkError = (error: unknown, url: string): Error => {
    if (!isNetworkFailure(error)) {
        return error instanceof Error ? error : new Error(String(error));
    }

    console.error('Network request failed:', { url, error });

    const hint = __DEV__
        ? ' If you use the Android emulator, DNS may be broken — cold boot the AVD or start it with: emulator -avd <name> -dns-server 8.8.8.8,8.8.4.4. Also run: npm run android:setup'
        : '';

    return new Error(
        `Network Error: Could not reach ${url}. Check your internet connection.${hint}`,
    );
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
        const response = await fetchWithTimeout(url, {
            method: "POST",
            headers: headers,
            body: JSON.stringify(body)
        });

        if(!response.ok) {
            await handleResponseError(response);
        }

        return await response.json();
    } catch (error: any) {
        throw mapFetchNetworkError(error, url);
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
        const response = await fetchWithTimeout(url, {
            method: "PATCH",
            headers: headers,
            body: JSON.stringify(body)
        });

        if(!response.ok) {
            await handleResponseError(response);
        }

        return await response.json();
    } catch (error: any) {
        throw mapFetchNetworkError(error, url);
    }
};

export const deleteRequest = async <T>(endpoint: string, token?: string): Promise<T> => {
    const headers = getHeaders(token);
    const url = buildUrl(endpoint);
    console.log(`DELETE Request: ${url}`, { headers });
    try {
        const response = await fetchWithTimeout(url, {
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
        throw mapFetchNetworkError(error, url);
    }
};

export const getRequest = async <T>(endpoint: string, token?: string): Promise<T> => {
    const headers = getHeaders(token);
    const url = buildUrl(endpoint);
    console.log(`GET Request: ${url}`, { headers });
    try {
        const response = await fetchWithTimeout(url, {
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
        throw mapFetchNetworkError(error, url);
    }
};
