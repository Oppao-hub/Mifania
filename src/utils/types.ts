export interface User {
    id?: number | string;
    customerId?: number;
    firstName?: string;
    lastName?: string;
    email: string;
    token?: string;
    roles?: string[];
    verified?: boolean;
}

export interface LoginCredentials {
    email: string;
    password?: string;
}

export interface LoginResponse {
    token: string,
    user: User;
    code?: number;
    message?: string;
}

export interface Customer {
    id: number;
    firstName: string;
    lastName: string;
    contactNumber?: string;
    address?: string;
    city?: string;
    country?: string;
    state?: string;
    postalCode?: string;
    avatar?: string;
    wallet?: Wallet;
}

export interface Wallet {
    id: number;
    balance: string;
    rewardPoints: number;
    walletTransactions?: WalletTransaction[];
}

export interface WalletTransaction {
    id: number;
    amount: string;
    type: string;
    description?: string;
    createdAt: string;
}

export interface Reward {
    id: number;
    name: string;
    description?: string;
    pointsRequired: number;
    isActive: boolean;
    createdAt: string;
}

export interface Redemption {
    id: number;
    reward: Reward;
    pointSpent: number;
    redeemedAt: string;
    status: string;
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
    id: number | string;
    name: string;
}

export interface CategoryState {
    items: Category[];
    isLoading: boolean;
    error: string | null;
}

export interface SubCategory {
    id: number | string;
    name: string;
    icon?: string;
    category: {
        id: number | string;
        name: string;
    };
}

export interface SubCategoryState {
    items: SubCategory[];
    isLoading: boolean;
    error: string | null;
}

export interface CartItem {
    id: number | string;
    product: Product;
    quantity: number;
    price: string;
    subtotal: string;
    selected?: boolean;
}

export interface Collection {
    id: number | string;
    name: string;
    isMain: boolean;
    totalPrice: string;
    totalQuantity: number;
    cartItems?: CartItem[];
}

export interface CartState {
    items: CartItem[];
    collections: Collection[];
    isLoading: boolean;
    error: string | null;
    totalPrice: string;
    totalQuantity: number;
}

export interface WishlistState {
    items: Product[];
}

export interface Notification {
    id: number | string;
    title: string;
    message?: string;
    body?: string; // Kept for local UI mapping compatibility
    type: string;
    isRead: boolean;
    createdAt: string;
    targetUrl?: string;
    // UI-only properties
    icon?: string;
    emoji?: string;
}

export interface RootState {
    authentication: AuthState;
    product: ProductState;
    category: CategoryState;
    subCategory: SubCategoryState;
    cart: CartState;
    wishlist: WishlistState;
    customer: {
        data: Customer | null;
        isLoading: boolean;
        isError: boolean;
        error: string | null;
    };
    loyalty: {
        wallet: Wallet | null;
        rewards: Reward[];
        redemptions: Redemption[];
        isLoading: boolean;
        isError: boolean;
        error: string | null;
    };
    order: {
        items: any[];
        isLoading: boolean;
        isError: boolean;
        error: string | null;
    };
    notification: {
        items: Notification[];
        isLoading: boolean;
        error: string | null;
    };
}
