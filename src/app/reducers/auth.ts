import * as Types from "../actions";
import { AuthState, User } from "../../utils/types";
import { REHYDRATE } from 'redux-persist';

const initialState: AuthState = {
    isLoading: false, 
    data: null, 
    isError: false,
    error: null,
    sessionValidated: false,
};

export function authReducer(state = initialState, action: { type: string; payload?: any }): AuthState {
    switch (action.type) {
        case Types.USER_LOGIN_REQUEST:
            return {
                ...state,
                isLoading: true, 
                isError: false 
            };
        case Types.USER_LOGIN_COMPLETED:
            return { 
                ...state, 
                isLoading: false, 
                data: action.payload, 
                isError: false,
                sessionValidated: true,
            };
        case Types.USER_LOGIN_ERROR:
            return { 
                ...state, 
                isLoading: false, 
                isError: true, 
                error: action.payload 
            };
        case Types.USER_LOGIN_UI_RESET:
            return {
                ...state,
                isLoading: false,
                isError: false,
                error: null,
            };
        case Types.USER_REGISTER_COMPLETED:
            return {
                ...state,
                isLoading: false,
                data: action.payload,
                isError: false,
                sessionValidated: true,
            };
        case Types.SESSION_RESTORE_VALIDATED:
            return {
                ...state,
                sessionValidated: true,
            };
        case Types.USER_LOGOUT:
        case Types.USER_LOGIN_RESET:
        case Types.USER_REGISTER_RESET:
            return { 
                ...state, 
                data: null, 
                isLoading: false, 
                isError: false,
                error: null,
                sessionValidated: false,
            };
        case Types.USER_REGISTER_REQUEST:
            return {
                ...state,
                isLoading: true,
                isError: false,
            };
        case Types.USER_REGISTER_ERROR:
            return {
                ...state,
                isLoading: false,
                isError: true,
                error: action.payload,
            };
        case REHYDRATE: {
            const incoming = action.payload?.authentication as AuthState | undefined;
            if (!incoming) {
                return state;
            }

            return {
                ...incoming,
                sessionValidated: false,
            };
        }
        default:
            return state;
    }
}

export const userLogin = (payload: any) => ({
    type: Types.USER_LOGIN,
    payload
});

export const userLoginCompleted = (payload: { user: User; token?: string }) => ({
    type: Types.USER_LOGIN_COMPLETED,
    payload
});

export const loginReset = () => ({
    type: Types.USER_LOGIN_RESET
});

/** Clears transient login UI state without wiping the session. */
export const loginUiReset = () => ({
    type: Types.USER_LOGIN_UI_RESET
});

export const userGoogleLogin = (idToken: string) => ({
    type: Types.USER_GOOGLE_LOGIN,
    payload: { idToken },
});

export const registerReset = () => ({
    type: Types.USER_REGISTER_RESET
});

export const userRegister = (payload: any) => ({
    type: Types.USER_REGISTER,
    payload
});