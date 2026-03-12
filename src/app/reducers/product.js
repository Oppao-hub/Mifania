import * as Type from '../actions';

const initialState = {
    items: [],
    isLoading: false,
    error: null,
};

export const productReducer = (state = initialState, action) => {
    switch (action.type) {
        case Type.GET_PRODUCTS_REQUEST:
            return {
                ...state,
                isLoading: true,
                error: null,
            };
        case Type.GET_PRODUCTS_SUCCESS:
            return {
                ...state,
                isLoading: false,
                items: action.payload,
            };
        case Type.GET_PRODUCTS_FAILURE:
            return {
                ...state,
                isLoading: false,
                error: action.payload,
            };
        case Type.GET_PEXELS_IMAGES_REQUEST:
            return{
                ...state,
                isLoading: true,
                error: null,
            }
        case Type.GET_PEXELS_IMAGES_SUCCESS:
            return{
                ...state,
                isLoading: false,
                items: action.payload,
            }
        case Type.GET_PEXELS_IMAGES_FAILURE:
            return{
                ...state,
                isLoading: false,
                items
            }
        default:
            return state;
        }
}

export const getProducts = () => ({
    type: Type.GET_PRODUCTS
});


export const getPexelsImages = () => ({
    type: Type.GET_PEXELS_IMAGES})
