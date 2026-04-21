import { AuthCredentials } from '../../types';
import { postRequest } from './client';

export const userLoginApi = async (credentials: AuthCredentials) => {
    return await postRequest("/login", credentials);
};

export const userRegisterApi = async ({ firstName, lastName, email, password }: AuthCredentials) => {
    const body = {
        firstName: firstName,
        lastName: lastName,
        email,
        password
    };
    return await postRequest("/register", body);
};