import { LoginCredentials, RegisterCredentials, LoginResponse, RegisterResponse } from '../../utils/types';
import { postRequest } from './client';

export const userLoginApi = async (credentials: LoginCredentials) => {
    return await postRequest<LoginResponse>("/login", credentials);
};

export const userGoogleLoginApi = async (idToken: string) => {
    return await postRequest<LoginResponse>("/login/google", { idToken });
};

export const userRegisterApi = async (credentials: RegisterCredentials) => {
    const body = {
        first_name: credentials.firstName,
        last_name: credentials.lastName,
        email: credentials.email,
        password: credentials.password
    };
    return await postRequest<RegisterResponse>("/register", body);
};