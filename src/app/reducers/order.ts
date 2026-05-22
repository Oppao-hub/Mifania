import * as Types from "../actions";
import { Order } from "../../utils/types";

interface OrderState {
    items: Order[];
    currentOrder: Order | null;
    isLoading: boolean;
    isError: boolean;
    error: string | null;
}

const initialState: OrderState = {
    items: [],
    currentOrder: null,
    isLoading: false,
    isError: false,
    error: null,
};

export function orderReducer(state = initialState, action: { type: string; payload?: any }): OrderState {
    switch (action.type) {
        case Types.GET_ORDERS_REQUEST:
        case Types.GET_ORDER_DETAILS_REQUEST:
        case Types.CREATE_ORDER_REQUEST:
            return { ...state, isLoading: true, isError: false };
        case Types.GET_ORDERS_COMPLETED:
            return { ...state, isLoading: false, items: action.payload, isError: false };
        case Types.GET_ORDER_DETAILS_COMPLETED:
            return { ...state, isLoading: false, currentOrder: action.payload, isError: false };
        case Types.CREATE_ORDER_COMPLETED:
            return { ...state, isLoading: false, isError: false };
        case Types.GET_ORDERS_ERROR:
        case Types.GET_ORDER_DETAILS_ERROR:
        case Types.CREATE_ORDER_ERROR:
            return { ...state, isLoading: false, isError: true, error: action.payload };
        default:
            return state;
    }
}
