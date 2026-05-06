import * as Types from '../actions';
import { CartState } from '../../utils/types';

const initialState: CartState = {
    items: [],
    collections: [],
    isLoading: false,
    error: null,
    totalPrice: '0.00',
    totalQuantity: 0,
};

export const cartReducer = (state = initialState, action: { type: string; payload?: any }): CartState => {
    switch (action.type) {
        case Types.GET_CART_REQUEST:
        case Types.ADD_TO_CART_REQUEST:
        case Types.UPDATE_CART_QTY_REQUEST:
        case Types.REMOVE_FROM_CART_REQUEST:
        case Types.GET_COLLECTIONS_REQUEST:
        case Types.CREATE_COLLECTION_REQUEST:
        case Types.SWITCH_COLLECTION_REQUEST:
        case Types.DELETE_COLLECTION_REQUEST:
            return {
                ...state,
                isLoading: true,
                error: null
            };

        case Types.GET_CART_COMPLETED:
            return {
                ...state,
                isLoading: false,
                items: action.payload.cartItems || [],
                totalPrice: action.payload.totalPrice || '0.00',
                totalQuantity: action.payload.totalQuantity || 0,
            };

        case Types.GET_COLLECTIONS_COMPLETED:
            return {
                ...state,
                isLoading: false,
                collections: action.payload['hydra:member'] || action.payload || [],
            };

        case Types.ADD_TO_CART_COMPLETED:
        case Types.UPDATE_CART_QTY_COMPLETED:
        case Types.REMOVE_FROM_CART_COMPLETED:
        case Types.CREATE_COLLECTION_COMPLETED:
        case Types.SWITCH_COLLECTION_COMPLETED:
        case Types.DELETE_COLLECTION_COMPLETED:
            return {
                ...state,
                isLoading: false,
            };

        case Types.GET_CART_ERROR:
        case Types.ADD_TO_CART_ERROR:
        case Types.UPDATE_CART_QTY_ERROR:
        case Types.REMOVE_FROM_CART_ERROR:
        case Types.GET_COLLECTIONS_ERROR:
        case Types.CREATE_COLLECTION_ERROR:
        case Types.SWITCH_COLLECTION_ERROR:
        case Types.DELETE_COLLECTION_ERROR:
            return {
                ...state,
                isLoading: false,
                error: action.payload
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
            return initialState;

        default:
            return state;
    }
};

// Action creators
export const getCart = () => ({
    type: Types.GET_CART
});

export const getCollections = () => ({
    type: Types.GET_COLLECTIONS
});

export const createCollection = (name: string) => ({
    type: Types.CREATE_COLLECTION,
    payload: name
});

export const switchCollection = (cartId: string | number) => ({
    type: Types.SWITCH_COLLECTION,
    payload: cartId
});

export const deleteCollection = (cartId: string | number) => ({
    type: Types.DELETE_COLLECTION,
    payload: cartId
});

export const addToCart = (productId: string | number, quantity: number = 1) => ({
    type: Types.ADD_TO_CART,
    payload: { productId, quantity }
});

export const removeFromCart = (cartItemId: string | number) => ({
    type: Types.REMOVE_FROM_CART,
    payload: cartItemId
});

export const updateCartQty = (cartItemId: string | number, quantity: number) => ({
    type: Types.UPDATE_CART_QTY,
    payload: { cartItemId, quantity }
});

export const toggleCartItemSelection = (id: string | number) => ({
    type: Types.TOGGLE_CART_ITEM_SELECTION,
    payload: id
});

export const clearCart = () => ({
    type: Types.CLEAR_CART
});
