import { call, put, takeLatest } from 'redux-saga/effects';
import { fetchProducts } from '../api/product';
import * as Type from '../actions';

function* fetchProductsWorker(): Generator<any, void, any> {
    yield put({ type: Type.GET_PRODUCTS_REQUEST});
    try {
        const data = yield call(fetchProducts);
        const products = Array.isArray(data) ? data : (data.member || data.data || []);
        yield put({ type: Type.GET_PRODUCTS_COMPLETED, payload: products});
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "An unknown error occurred";
        yield put({ type: Type.GET_PRODUCTS_ERROR, payload: message });
    }
}

export function* watchProduct() {
    yield takeLatest(Type.GET_PRODUCTS, fetchProductsWorker); 
}