import * as Types from "../actions";
import { Order } from "../../utils/types";

interface OrderState {
    items: Order[];
    currentOrder: Order | null;
    isLoading: boolean;
    isError: boolean;
    error: string | null;
    cancelError: string | null;
    deleteError: string | null;
    lastCreatedOrder: Order | null;
}

const initialState: OrderState = {
    items: [],
    currentOrder: null,
    isLoading: false,
    isError: false,
    error: null,
    cancelError: null,
    deleteError: null,
    lastCreatedOrder: null,
};

export function orderReducer(state = initialState, action: { type: string; payload?: any }): OrderState {
    switch (action.type) {
        case Types.GET_ORDERS_REQUEST:
        case Types.GET_ORDER_DETAILS_REQUEST:
        case Types.CREATE_ORDER_REQUEST:
            return { ...state, isLoading: true, isError: false };
        case Types.CANCEL_ORDER_REQUEST:
            return { ...state, isLoading: true, cancelError: null };
        case Types.DELETE_ORDER_REQUEST:
            return { ...state, isLoading: true, deleteError: null };
        case Types.GET_ORDERS_COMPLETED:
            return { ...state, isLoading: false, items: action.payload, isError: false };
        case Types.GET_ORDER_DETAILS_COMPLETED:
            return { ...state, isLoading: false, currentOrder: action.payload, isError: false };
        case Types.CREATE_ORDER_COMPLETED:
            return {
                ...state,
                isLoading: false,
                isError: false,
                error: null,
                lastCreatedOrder: action.payload,
            };
        case Types.CANCEL_ORDER_COMPLETED: {
            const cancelledId = Number(action.payload?.id);
            const cancelledStatus = action.payload?.orderStatus || 'Cancelled';
            return {
                ...state,
                isLoading: false,
                isError: false,
                error: null,
                cancelError: null,
                currentOrder: state.currentOrder
                    ? {
                          ...state.currentOrder,
                          orderStatus: cancelledStatus as Order['orderStatus'],
                      }
                    : null,
                items: state.items.map((order) =>
                    Number(order.id) === cancelledId
                        ? { ...order, orderStatus: cancelledStatus as Order['orderStatus'] }
                        : order,
                ),
            };
        }
        case Types.GET_ORDERS_ERROR:
        case Types.GET_ORDER_DETAILS_ERROR:
        case Types.CREATE_ORDER_ERROR:
            return { ...state, isLoading: false, isError: true, error: action.payload };
        case Types.CANCEL_ORDER_ERROR:
            return { ...state, isLoading: false, cancelError: action.payload };
        case Types.DELETE_ORDER_COMPLETED: {
            const deletedId = Number(action.payload?.id);
            return {
                ...state,
                isLoading: false,
                deleteError: null,
                currentOrder:
                    state.currentOrder && Number(state.currentOrder.id) === deletedId
                        ? null
                        : state.currentOrder,
                items: state.items.filter((order) => Number(order.id) !== deletedId),
            };
        }
        case Types.DELETE_ORDER_ERROR:
            return { ...state, isLoading: false, deleteError: action.payload };
        default:
            return state;
    }
}
