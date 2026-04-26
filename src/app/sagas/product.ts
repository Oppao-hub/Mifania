import { call, put, takeLatest } from 'redux-saga/effects';
import { fetchProducts } from '../api/product';
import * as Type from '../actions';

function* fetchProductsWorker(): Generator<any, void, any> {
    yield put({ type: Type.GET_PRODUCTS_REQUEST});
    try {
        const response = yield call(fetchProducts);
        const data = yield response.json();

        if (response.ok) {
            yield put({ type: Type.GET_PRODUCTS_COMPLETED, payload: data });
        } else {
            yield put({ type: Type.GET_PRODUCTS_ERROR, payload: data.message || 'Error fetching products.' });
        }
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "An unknown error occurred";
        yield put({ type: Type.GET_PRODUCTS_ERROR, payload: message });
    }
}

export function* watchProduct() {
    yield takeLatest(Type.GET_PRODUCTS, fetchProductsWorker); 
}