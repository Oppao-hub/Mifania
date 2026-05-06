import * as Types from '../actions';
import { WishlistState, Product } from '../../utils/types';

const initialState: WishlistState = {
    items: [],
};

export const wishlistReducer = (state = initialState, action: { type: string; payload?: any }): WishlistState => {
    switch (action.type) {
        case Types.TOGGLE_WISHLIST:
            const exists = state.items.find(item => item.id === action.payload.id);
            if (exists) {
                return {
                    ...state,
                    items: state.items.filter(item => item.id !== action.payload.id),
                };
            }
            return {
                ...state,
                items: [...state.items, action.payload],
            };

        case Types.CLEAR_WISHLIST:
            return {
                ...state,
                items: [],
            };

        default:
            return state;
    }
};

export const toggleWishlist = (product: Product) => ({
    type: Types.TOGGLE_WISHLIST,
    payload: product
});

export const clearWishlist = () => ({
    type: Types.CLEAR_WISHLIST
});
