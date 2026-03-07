import * as Types from "../actions";

const initialState = {
    isLoading: false, 
    data: null, 
    error: null
};

export function authReducer(state = initialState , action) {
    switch (action.type) {
        case Types.USER_LOGIN_REQUEST:
            console.log("USER_LOGIN_REQUEST", action.payload);
            return { 
                ...state,
                isLoading: true, 
                isError: false 
            };
        case Types.USER_LOGIN_COMPLETED:
            console.log("USER_LOGIN_COMPLETED", action.payload);
            return { 
                ...state, 
                isLoading: false, 
                data: action.payload, 
                isError: false 
            };
        case Types.USER_LOGIN_ERROR:
            console.log("USER_LOGIN_ERROR", action.payload);
            return { 
                ...state, 
                isLoading: false, 
                isError: true, error: 
                action.payload 
            };
        case Types.USER_LOGIN_RESET:
            console.log("USER_LOGIN_RESET", action.payload);
            return { 
                ...state, 
                data: null, 
                isLoading: false, 
                isError:false 
            };
        default:
            return state;
    }
}