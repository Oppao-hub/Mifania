import { postRequest } from './client';

export const userLoginApi = async (credentials: any) => {
    return await postRequest("/login", credentials);
};

export const userRegisterApi = async ({ firstName, lastName, email, password }: any) => {
    const body = {
        firstName: firstName,
        lastName: lastName,
        email,
        password
    };
    return await postRequest("/register", body);
};