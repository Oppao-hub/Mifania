import * as Types from '../actions';
import { WishlistState, Product } from '../../utils/types';

const initialState: WishlistState = {
    items: [],
    isLoading: false,
    error: null,
};

const toggleProductInList = (items: Product[], product: Product): Product[] => {
    const exists = items.find((item) => item.id === product.id);
    if (exists) {
        return items.filter((item) => item.id !== product.id);
    }
    return [...items, product];
};

export const wishlistReducer = (state = initialState, action: { type: string; payload?: any }): WishlistState => {
    switch (action.type) {
        case Types.GET_WISHLIST_REQUEST:
        case Types.TOGGLE_WISHLIST_REQUEST:
            return {
                ...state,
                isLoading: true,
                error: null,
            };

        case Types.GET_WISHLIST_COMPLETED:
            return {
                ...state,
                isLoading: false,
                items: action.payload || [],
                error: null,
            };

        case Types.TOGGLE_WISHLIST_COMPLETED: {
            const { added, product } = action.payload;
            const exists = state.items.some((item) => item.id === product.id);

            if (added && !exists) {
                return {
                    ...state,
                    isLoading: false,
                    items: [...state.items, product],
                    error: null,
                };
            }

            if (!added && exists) {
                return {
                    ...state,
                    isLoading: false,
                    items: state.items.filter((item) => item.id !== product.id),
                    error: null,
                };
            }

            return {
                ...state,
                isLoading: false,
                error: null,
            };
        }

        case Types.TOGGLE_WISHLIST_LOCAL:
            return {
                ...state,
                items: toggleProductInList(state.items, action.payload),
            };

        case Types.GET_WISHLIST_ERROR:
        case Types.TOGGLE_WISHLIST_ERROR:
            return {
                ...state,
                isLoading: false,
                error: action.payload,
            };

        case Types.CLEAR_WISHLIST:
        case Types.USER_LOGOUT:
            return initialState;

        default:
            return state;
    }
};

export const toggleWishlist = (product: Product) => ({
    type: Types.TOGGLE_WISHLIST,
    payload: product,
});

export const getWishlist = () => ({
    type: Types.GET_WISHLIST,
});

export const clearWishlist = () => ({
    type: Types.CLEAR_WISHLIST,
});
