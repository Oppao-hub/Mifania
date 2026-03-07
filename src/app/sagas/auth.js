import { call, put, takeLatest } from 'redux-saga/effects';
import { userLoginApi } from '../api/auth';
import { 
    USER_LOGIN_REQUEST, 
    USER_LOGIN_COMPLETED, 
    USER_LOGIN_ERROR 
} from '../actions';

function* handleLogin(action) {
    try {
        const response = yield call(userLoginApi, action.payload);
        
        if (!response) throw new Error("No response from server.");

        const data = yield response.json();

        if (response.ok) {
            yield put({ type: USER_LOGIN_COMPLETED, payload: data });
        } else {
            throw new Error(data?.message || "Invalid email or password.");
        }
    } catch (error) {
        yield put({ type: USER_LOGIN_ERROR, payload: error.message });
    }
}

export function* watchAuth() {
    yield takeLatest(USER_LOGIN_REQUEST, handleLogin);
}