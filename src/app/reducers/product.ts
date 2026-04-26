import * as Type from '../actions';
import { ProductState } from '../../types';

const initialState: ProductState = {
    items: [],
    isLoading: false,
    error: null,
};

export const productReducer = (state = initialState, action: { type: string; payload?: any }): ProductState => {
    switch (action.type) {
        case Type.GET_PRODUCTS_REQUEST:
            return {
                ...state,
                isLoading: true,
                error: null,
            };
        case Type.GET_PRODUCTS_COMPLETED:
            return {
                ...state,
                isLoading: false,
                items: action.payload,
            };
        case Type.GET_PRODUCTS_ERROR:
            return {
                ...state,
                isLoading: false,
                error: action.payload,
            };
        default:
            return state;
        }
}

export const getProducts = () => ({
    type: Type.GET_PRODUCTS
});