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
            console.log("📦 REDUCER: Saving customer data:", action.payload);
            return { 
                ...state, 
                isLoading: false, 
                data: action.payload,
                isError: false 
            };
        case Types.UPDATE_CUSTOMER_COMPLETED:
            return { ...state, isLoading: false, data: action.payload, isError: false };
        case Types.GET_CUSTOMER_ERROR:
            return { ...state, isLoading: false, isError: true, error: action.payload };
        case Types.UPDATE_CUSTOMER_ERROR:
            return { ...state, isLoading: false, isError: true, error: action.payload };
        
        case Types.USER_LOGOUT:
            return initialState;

        // 💡 Listen for successful login and pick up nested customer data if present
        case Types.USER_LOGIN_COMPLETED:
            if (action.payload.user?.customer && typeof action.payload.user.customer === 'object' && 'firstName' in action.payload.user.customer) {
                return {
                    ...state,
                    data: action.payload.user.customer,
                    isLoading: false,
                    isError: false
                };
            }
            return state;
            
        default:
            return state;
    }
}
