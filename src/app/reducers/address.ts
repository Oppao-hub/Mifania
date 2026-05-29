import * as Types from '../actions';
import { CustomerAddress } from '../../utils/types';

interface AddressState {
    items: CustomerAddress[];
    isLoading: boolean;
    isError: boolean;
    error: string | null;
}

const initialState: AddressState = {
    items: [],
    isLoading: false,
    isError: false,
    error: null,
};

export function addressReducer(state = initialState, action: { type: string; payload?: any }): AddressState {
    switch (action.type) {
        case Types.GET_ADDRESSES_REQUEST:
        case Types.CREATE_ADDRESS_REQUEST:
        case Types.UPDATE_ADDRESS_REQUEST:
        case Types.DELETE_ADDRESS_REQUEST:
            return { ...state, isLoading: true, isError: false, error: null };

        case Types.GET_ADDRESSES_COMPLETED:
            return {
                ...state,
                isLoading: false,
                items: action.payload || [],
                isError: false,
            };

        case Types.CREATE_ADDRESS_COMPLETED:
        case Types.UPDATE_ADDRESS_COMPLETED:
        case Types.DELETE_ADDRESS_COMPLETED:
            return { ...state, isLoading: false, isError: false };

        case Types.GET_ADDRESSES_ERROR:
        case Types.CREATE_ADDRESS_ERROR:
        case Types.UPDATE_ADDRESS_ERROR:
        case Types.DELETE_ADDRESS_ERROR:
            return { ...state, isLoading: false, isError: true, error: action.payload };

        case Types.USER_LOGOUT:
            return initialState;

        default:
            return state;
    }
}
