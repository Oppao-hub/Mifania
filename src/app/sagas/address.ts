import { call, put, select, takeEvery } from 'redux-saga/effects';
import * as Type from '../actions';
import {
    createAddressApi,
    deleteAddressApi,
    getAddressesApi,
    updateAddressApi,
} from '../api/address';
import { RootState } from '../../utils/types';

const getToken = (state: RootState) => state.authentication.data?.token;

export function* getAddressesAsync(): Generator<any, void, any> {
    const token = yield select(getToken);
    if (!token) return;

    yield put({ type: Type.GET_ADDRESSES_REQUEST });
    try {
        const data = yield call(getAddressesApi, token);
        yield put({ type: Type.GET_ADDRESSES_COMPLETED, payload: data });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Failed to load addresses';
        if (message === 'Unauthorized') {
            yield put({ type: Type.USER_LOGOUT });
        }
        yield put({ type: Type.GET_ADDRESSES_ERROR, payload: message });
    }
}

export function* createAddressAsync(action: {
    type: string;
    payload: { data: Record<string, unknown> };
}): Generator<any, void, any> {
    const token = yield select(getToken);
    if (!token) return;

    yield put({ type: Type.CREATE_ADDRESS_REQUEST });
    try {
        const data = yield call(createAddressApi, action.payload.data, token);
        yield put({ type: Type.CREATE_ADDRESS_COMPLETED, payload: data });
        yield put({ type: Type.GET_ADDRESSES });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Failed to create address';
        yield put({ type: Type.CREATE_ADDRESS_ERROR, payload: message });
    }
}

export function* updateAddressAsync(action: {
    type: string;
    payload: { id: string | number; data: Record<string, unknown> };
}): Generator<any, void, any> {
    const token = yield select(getToken);
    if (!token) return;

    yield put({ type: Type.UPDATE_ADDRESS_REQUEST });
    try {
        const data = yield call(updateAddressApi, action.payload.id, action.payload.data, token);
        yield put({ type: Type.UPDATE_ADDRESS_COMPLETED, payload: data });
        yield put({ type: Type.GET_ADDRESSES });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Failed to update address';
        yield put({ type: Type.UPDATE_ADDRESS_ERROR, payload: message });
    }
}

export function* deleteAddressAsync(action: {
    type: string;
    payload: { id: string | number };
}): Generator<any, void, any> {
    const token = yield select(getToken);
    if (!token) return;

    yield put({ type: Type.DELETE_ADDRESS_REQUEST });
    try {
        yield call(deleteAddressApi, action.payload.id, token);
        yield put({ type: Type.DELETE_ADDRESS_COMPLETED, payload: action.payload.id });
        yield put({ type: Type.GET_ADDRESSES });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Failed to delete address';
        yield put({ type: Type.DELETE_ADDRESS_ERROR, payload: message });
    }
}

export function* watchAddress() {
    yield takeEvery(Type.GET_ADDRESSES, getAddressesAsync);
    yield takeEvery(Type.CREATE_ADDRESS, createAddressAsync);
    yield takeEvery(Type.UPDATE_ADDRESS, updateAddressAsync);
    yield takeEvery(Type.DELETE_ADDRESS, deleteAddressAsync);
}
