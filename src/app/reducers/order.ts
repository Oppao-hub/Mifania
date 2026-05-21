import * as Types from "../actions";

interface OrderState {
    items: any[];
    isLoading: boolean;
    isError: boolean;
    error: string | null;
}

const initialState: OrderState = {
    items: [],
    isLoading: false,
    isError: false,
    error: null,
};

export function orderReducer(state = initialState, action: { type: string; payload?: any }): OrderState {
    switch (action.type) {
        case Types.GET_ORDERS_REQUEST:
        case Types.CREATE_ORDER_REQUEST:
            return { ...state, isLoading: true, isError: false };
        case Types.GET_ORDERS_COMPLETED:
            return { ...state, isLoading: false, items: action.payload, isError: false };
        case Types.CREATE_ORDER_COMPLETED:
            return { ...state, isLoading: false, isError: false };
        case Types.GET_ORDERS_ERROR:
        case Types.CREATE_ORDER_ERROR:
            return { ...state, isLoading: false, isError: true, error: action.payload };
        default:
            return state;
    }
}
