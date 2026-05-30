import { LoginCredentials, RegisterCredentials, LoginResponse, RegisterResponse } from '../../utils/types';
import { deleteRequest, isApiRequestError, patchRequest, postRequest } from './client';

export const userLoginApi = async (credentials: LoginCredentials) => {
    const body = {
        ...credentials,
        username: credentials.email // Symfony often expects 'username' key
    };
    console.log("📤 Login API Payload:", JSON.stringify(body));
    return await postRequest<LoginResponse>("/login", body);
};

export const userGoogleLoginApi = async (idToken: string) => {
    return await postRequest<LoginResponse>("/login/google", { idToken });
};

export const userRegisterApi = async (credentials: RegisterCredentials) => {
    const body = {
        firstName: credentials.firstName,
        lastName: credentials.lastName,
        email: credentials.email,
        password: credentials.password
    };
    return await postRequest<RegisterResponse>("/register", body);
};

type DeviceTokenRegistrationContext = {
    userId?: number;
    customerIri?: string | null;
};

export const registerDeviceTokenApi = async (
    deviceToken: string,
    token: string,
    context: DeviceTokenRegistrationContext = {},
) => {
    try {
        return await postRequest<{ success: boolean }>('/device-token', { deviceToken }, token);
    } catch (error) {
        if (!isApiRequestError(error) || error.status !== 404) {
            throw error;
        }

        if (context.userId) {
            return await patchRequest<{ success: boolean }>(
                `/users/${context.userId}`,
                { deviceToken },
                token,
            );
        }

        if (context.customerIri) {
            return await patchRequest<{ success: boolean }>(
                context.customerIri,
                { user: { deviceToken } },
                token,
            );
        }

        throw error;
    }
};

export const clearDeviceTokenApi = async (token: string) => {
    try {
        return await deleteRequest<{ success: boolean }>('/device-token', token);
    } catch (error) {
        if (isApiRequestError(error) && error.status === 404) {
            return { success: true };
        }
        throw error;
    }
};
