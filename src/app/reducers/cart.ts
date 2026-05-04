import * as Types from '../actions';
import { CartState, CartItem } from '../../utils/types';

const initialState: CartState = {
    items: [],
};

export const cartReducer = (state = initialState, action: { type: string; payload?: any }): CartState => {
    switch (action.type) {
        case Types.ADD_TO_CART:
            const existingItem = state.items.find(item => item.id === action.payload.id);
            if (existingItem) {
                return {
                    ...state,
                    items: state.items.map(item =>
                        item.id === action.payload.id
                            ? { ...item, qty: item.qty + (action.payload.qty || 1) }
                            : item
                    ),
                };
            }
            return {
                ...state,
                items: [...state.items, { ...action.payload, qty: action.payload.qty || 1, selected: true }],
            };

        case Types.REMOVE_FROM_CART:
            return {
                ...state,
                items: state.items.filter(item => item.id !== action.payload),
            };

        case Types.UPDATE_CART_QTY:
            return {
                ...state,
                items: state.items.map(item =>
                    item.id === action.payload.id
                        ? { ...item, qty: action.payload.qty }
                        : item
                ),
            };

        case Types.TOGGLE_CART_ITEM_SELECTION:
            return {
                ...state,
                items: state.items.map(item =>
                    item.id === action.payload
                        ? { ...item, selected: !item.selected }
                        : item
                ),
            };

        case Types.CLEAR_CART:
            return {
                ...state,
                items: [],
            };

        default:
            return state;
    }
};

export const addToCart = (product: any) => ({
    type: Types.ADD_TO_CART,
    payload: product
});

export const removeFromCart = (id: string | number) => ({
    type: Types.REMOVE_FROM_CART,
    payload: id
});

export const updateCartQty = (id: string | number, qty: number) => ({
    type: Types.UPDATE_CART_QTY,
    payload: { id, qty }
});

export const toggleCartItemSelection = (id: string | number) => ({
    type: Types.TOGGLE_CART_ITEM_SELECTION,
    payload: id
});

export const clearCart = () => ({
    type: Types.CLEAR_CART
});
