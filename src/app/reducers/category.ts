import * as Types from '../actions';
import { CategoryState } from '../../utils/types';

const initialState: CategoryState = {
    items: [],
    isLoading: false,
    error: null,
}

export const categoryReducer = (state = initialState, action: { type: string; payload?: any }): CategoryState => {
    switch (action.type) {
        case Types.GET_CATEGORIES_REQUEST:
            return {
                ...state,
                isLoading: true,
                error: null,
            };
        case Types.GET_CATEGORIES_COMPLETED:
            return {
                ...state,
                isLoading: false,
                items: action.payload,
            };
        case Types.GET_CATEGORIES_ERROR:
            return {
                ...state,
                isLoading: false,
                error: action.payload,
            };
        default:
            return state;
        }
}

export const getCategories = () => ({
    type: Types.GET_CATEGORIES
});