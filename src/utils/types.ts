export interface User {
    id?: number | string;
    firstName?: string;
    lastName?: string;
    email: string;
    token?: string;
}

export interface LoginCredentials {
    email: string;
    password?: string;
}

export interface LoginResponse {
    token: string,
    user: {
        id: number;
        email: string;
        roles: string [];
        verified: boolean;
    }
    code: number;
    message: string;
}

export interface RegisterCredentials {
    email: string;
    password?: string;
    firstName?: string;
    lastName?: string;
}

export interface RegisterResponse {
    success: boolean;
    message: string;
    user: {
        id: number;
        firstName: string;
        lastName: string,
        email: string,
        isVerified: boolean,
        roles: string []
    }
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
    name: string;
    image: string;
    imageUrl?: string;
    description?: string;
    price?: string;
    subCategory?: string; // This is the IRI like "/api/sub_categories/1"
}

export interface ProductState {
    items: Product[];
    isLoading: boolean;
    error: string | null;
}

export interface Category {
    id: number;
    name: string;
}

export interface CategoryState {
    items: Category[];
    isLoading: boolean;
    error: string | null;
}

export interface SubCategory {
    id: number;
    name: string;
    icon?: string;
    category: {
        id: number;
        name: string;
    };
}

export interface SubCategoryState {
    items: SubCategory[];
    isLoading: boolean;
    error: string | null;
}

export interface CartItem extends Product {
    size: string;
    color: string;
    qty: number;
    selected: boolean;
}

export interface CartState {
    items: CartItem[];
}

export interface WishlistState {
    items: Product[];
}

export interface RootState {
    authentication: AuthState;
    product: ProductState;
    category: CategoryState;
    subCategory: SubCategoryState;
    cart: CartState;
    wishlist: WishlistState;
}
