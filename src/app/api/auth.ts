import { AuthCredentials } from '../../types';
import { postRequest } from './client';

export const userLoginApi = async (credentials: AuthCredentials) => {
    return await postRequest("/login", credentials);
};

export const userGoogleLoginApi = async (idToken: string) => {
    return await postRequest("/login/google", { idToken });
};

export const userRegisterApi = async (credentials: AuthCredentials) => {
    const body = {
        first_name: credentials.firstName || credentials.first_name,
        last_name: credentials.lastName || credentials.last_name,
        email: credentials.email,
        password: credentials.password
    };
    return await postRequest("/register", body);
};