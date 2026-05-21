import * as Types from "../actions";
import { Customer } from "../../utils/types";

interface CustomerState {
    data: Customer | null;
    isLoading: boolean;
    isError: boolean;
    error: string | null;
}

const initialState: CustomerState = {
    data: null,
    isLoading: false,
    isError: false,
    error: null,
};

export function customerReducer(state = initialState, action: { type: string; payload?: any }): CustomerState {
    switch (action.type) {
        case Types.GET_CUSTOMER_REQUEST:
        case Types.UPDATE_CUSTOMER_REQUEST:
            return { ...state, isLoading: true, isError: false };
        case Types.GET_CUSTOMER_COMPLETED:
        case Types.UPDATE_CUSTOMER_COMPLETED:
            return { ...state, isLoading: false, data: action.payload, isError: false };
        case Types.GET_CUSTOMER_ERROR:
        case Types.UPDATE_CUSTOMER_ERROR:
            return { ...state, isLoading: false, isError: true, error: action.payload };
        default:
            return state;
    }
}
