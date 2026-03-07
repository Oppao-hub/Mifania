import { postRequest } from './client';

export const userLoginApi = async (credentials) => {
    return await postRequest("/login", credentials);
};

export const userRegisterApi = async ({ firstName, lastName, email, password }) => {
    const body = {
        first_name: firstName,
        last_name: lastName,
        email,
        password
    };
    return await postRequest("/register", body);
};