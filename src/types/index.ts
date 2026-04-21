export interface User {
    id?: number;
    first_name: string;
    last_name?: string;
    email: string;
    token?: string;
}

export interface AuthState {
    isLoading: boolean;
    data: {
        user: User;
        token?: string;
    } | null;
    isError: boolean;
    error: string | null;
}

export interface Product {
    id: number | string;
    title: string;
    image: string;
    description?: string;
    price?: number;
}

export interface ProductState {
    items: Product[];
    isLoading: boolean;
    error: string | null;
}

export interface RootState {
    authentication: AuthState;
    product: ProductState;
}

export interface AuthCredentials {
    email: string;
    password?: string;
    firstName?: string;
    lastName?: string;
    first_name?: string;
    last_name?: string;
}
