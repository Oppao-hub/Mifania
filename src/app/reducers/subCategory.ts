import * as Types from '../actions';
import { SubCategoryState } from '../../utils/types';

const initialState: SubCategoryState = {
    items: [],
    isLoading: false,
    error: null,
}

export const subCategoryReducer = (state = initialState, action: { type: string; payload?: any }): SubCategoryState => {
    switch (action.type) {
        case Types.GET_SUB_CATEGORIES_REQUEST:
            return {
                ...state,
                isLoading: true,
                error: null,
            };
        case Types.GET_SUB_CATEGORIES_COMPLETED:
            return {
                ...state,
                isLoading: false,
                items: action.payload,
            };
        case Types.GET_SUB_CATEGORIES_ERROR:
            return {
                ...state,
                isLoading: false,
                error: action.payload,
            };
        default:
            return state;
        }
}

export const getSubCategories = () => ({
    type: Types.GET_SUB_CATEGORIES
});