import { LoginCredentials, RegisterCredentials, LoginResponse, RegisterResponse } from '../../utils/types';
import { postRequest, patchRequest } from './client';

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

export const userUpdateDeviceTokenApi = async (customerIri: string, deviceToken: string, token: string) => {
    const body = {
        user: {
            deviceToken: deviceToken
        }
    };
    return await patchRequest<any>(customerIri, body, token);
};