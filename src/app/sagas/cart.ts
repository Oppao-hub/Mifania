import { takeEvery, call, put, select } from 'redux-saga/effects';
import * as Type from '../actions';
import { 
    getCartApi, 
    addToCartApi, 
    updateCartItemApi, 
    deleteCartItemApi,
    getCollectionsApi,
    createCollectionApi,
    switchCollectionApi,
    deleteCollectionApi
} from '../api/cart';
import { RootState } from '../../utils/types';

// Selector to get token
const getToken = (state: RootState) => state.authentication.data?.token;

export function* getCartAsync(): Generator<any, void, any> {
    const token = yield select(getToken);
    if (!token) return;

    yield put({ type: Type.GET_CART_REQUEST });
    try {
        const data = yield call(getCartApi, token);
        yield put({ type: Type.GET_CART_COMPLETED, payload: data });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "An unknown error occurred";
        yield put({ type: Type.GET_CART_ERROR, payload: message });
    }
}

export function* getCollectionsAsync(): Generator<any, void, any> {
    const token = yield select(getToken);
    if (!token) return;

    yield put({ type: Type.GET_COLLECTIONS_REQUEST });
    try {
        const data = yield call(getCollectionsApi, token);
        yield put({ type: Type.GET_COLLECTIONS_COMPLETED, payload: data });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "An unknown error occurred";
        yield put({ type: Type.GET_COLLECTIONS_ERROR, payload: message });
    }
}

export function* createCollectionAsync(action: { type: string; payload: string }): Generator<any, void, any> {
    const token = yield select(getToken);
    if (!token) return;

    yield put({ type: Type.CREATE_COLLECTION_REQUEST });
    try {
        yield call(createCollectionApi, action.payload, token);
        yield put({ type: Type.CREATE_COLLECTION_COMPLETED });
        yield call(getCollectionsAsync);
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "An unknown error occurred";
        yield put({ type: Type.CREATE_COLLECTION_ERROR, payload: message });
    }
}

export function* switchCollectionAsync(action: { type: string; payload: number | string }): Generator<any, void, any> {
    const token = yield select(getToken);
    if (!token) return;

    yield put({ type: Type.SWITCH_COLLECTION_REQUEST });
    try {
        yield call(switchCollectionApi, action.payload, token);
        yield put({ type: Type.SWITCH_COLLECTION_COMPLETED });
        // After switching, refresh both the full cart and the collections list
        yield call(getCartAsync);
        yield call(getCollectionsAsync);
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "An unknown error occurred";
        yield put({ type: Type.SWITCH_COLLECTION_ERROR, payload: message });
    }
}

export function* deleteCollectionAsync(action: { type: string; payload: number | string }): Generator<any, void, any> {
    const token = yield select(getToken);
    if (!token) return;

    yield put({ type: Type.DELETE_COLLECTION_REQUEST });
    try {
        yield call(deleteCollectionApi, action.payload, token);
        yield put({ type: Type.DELETE_COLLECTION_COMPLETED });
        yield call(getCollectionsAsync);
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "An unknown error occurred";
        yield put({ type: Type.DELETE_COLLECTION_ERROR, payload: message });
    }
}

export function* addToCartAsync(action: { type: string; payload: any }): Generator<any, void, any> {
    const token = yield select(getToken);
    if (!token) return;

    yield put({ type: Type.ADD_TO_CART_REQUEST });
    try {
        yield call(addToCartApi, action.payload.productId, action.payload.quantity, token);
        yield put({ type: Type.ADD_TO_CART_COMPLETED });
        // Refresh cart after adding
        yield call(getCartAsync);
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "An unknown error occurred";
        yield put({ type: Type.ADD_TO_CART_ERROR, payload: message });
    }
}

export function* updateCartQtyAsync(action: { type: string; payload: any }): Generator<any, void, any> {
    const token = yield select(getToken);
    if (!token) return;

    yield put({ type: Type.UPDATE_CART_QTY_REQUEST });
    try {
        yield call(updateCartItemApi, action.payload.cartItemId, action.payload.quantity, token);
        yield put({ type: Type.UPDATE_CART_QTY_COMPLETED });
        yield call(getCartAsync);
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "An unknown error occurred";
        yield put({ type: Type.UPDATE_CART_QTY_ERROR, payload: message });
    }
}

export function* removeFromCartAsync(action: { type: string; payload: any }): Generator<any, void, any> {
    const token = yield select(getToken);
    if (!token) return;

    yield put({ type: Type.REMOVE_FROM_CART_REQUEST });
    try {
        yield call(deleteCartItemApi, action.payload, token);
        yield put({ type: Type.REMOVE_FROM_CART_COMPLETED });
        yield call(getCartAsync);
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "An unknown error occurred";
        yield put({ type: Type.REMOVE_FROM_CART_ERROR, payload: message });
    }
}

export function* watchCart() {
    yield takeEvery(Type.GET_CART, getCartAsync);
    yield takeEvery(Type.GET_COLLECTIONS, getCollectionsAsync);
    yield takeEvery(Type.CREATE_COLLECTION, createCollectionAsync);
    yield takeEvery(Type.SWITCH_COLLECTION, switchCollectionAsync);
    yield takeEvery(Type.DELETE_COLLECTION, deleteCollectionAsync);
    yield takeEvery(Type.ADD_TO_CART, addToCartAsync);
    yield takeEvery(Type.UPDATE_CART_QTY, updateCartQtyAsync);
    yield takeEvery(Type.REMOVE_FROM_CART, removeFromCartAsync);
}
