import * as Types from "../actions";
import { Notification } from "../../utils/types";

interface NotificationState {
    items: Notification[];
    isLoading: boolean;
    error: string | null;
}

const initialState: NotificationState = {
    items: [],
    isLoading: false,
    error: null,
};

export function notificationReducer(state = initialState, action: { type: string; payload?: any }): NotificationState {
    switch (action.type) {
        case Types.GET_NOTIFICATIONS_REQUEST:
            return { ...state, isLoading: true, error: null };
            
        case Types.GET_NOTIFICATIONS_COMPLETED:
            return { 
                ...state, 
                isLoading: false, 
                items: action.payload,
            };
            
        case Types.GET_NOTIFICATIONS_ERROR:
            return { ...state, isLoading: false, error: action.payload };

        case Types.ADD_NOTIFICATION:
            // Check if notification already exists (by ID) to avoid duplicates
            const exists = state.items.find(item => item.id === action.payload.id);
            if (exists) return state;
            
            return {
                ...state,
                items: [action.payload, ...state.items],
            };
            
        case Types.MARK_NOTIFICATION_READ:
            const targetId = typeof action.payload === 'number'
                ? action.payload
                : Number(action.payload?.id);

            return {
                ...state,
                items: state.items.map(item =>
                    Number(item.id) === targetId ? { ...item, isRead: true } : item
                ),
            };

        case Types.MARK_ALL_NOTIFICATIONS_READ:
            return {
                ...state,
                items: state.items.map(item => ({ ...item, isRead: true })),
            };
            
        case Types.CLEAR_NOTIFICATIONS:
            return state;
            
        default:
            return state;
    }
}
