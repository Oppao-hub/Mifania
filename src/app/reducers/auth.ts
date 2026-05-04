import * as Types from "../actions";
import { AuthState, User } from "../../utils/types";

const initialState: AuthState = {
    isLoading: false, 
    data: null, 
    isError: false,
    error: null
};

export function authReducer(state = initialState, action: { type: string; payload?: any }): AuthState {
    console.log(action.type);
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
                isError: false 
            };
        case Types.USER_LOGIN_ERROR:
            return { 
                ...state, 
                isLoading: false, 
                isError: true, 
                error: action.payload 
            };
        case Types.USER_LOGIN_RESET:
            return { 
                ...state, 
                data: null, 
                isLoading: false, 
                isError:false 
            };
        case Types.USER_REGISTER_REQUEST:
            return {
                ...state,
                isLoading: true,
                isError: false,
            }
        case Types.USER_REGISTER_COMPLETED:
            return {
                ...state,
                isLoading: false,
                data: action.payload,
                isError: false,
            }
        case Types.USER_REGISTER_ERROR:
            return {
                ...state,
                isLoading: false,
                isError: true,
                error: action.payload,
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

export const userRegister = (payload: any) => ({
    type: Types.USER_REGISTER,
    payload
});