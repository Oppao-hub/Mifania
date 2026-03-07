import { call, put, takeLatest } from 'redux-saga/effects';
import { fetchProducts } from '../api/product';
import * as Type from '../actions';

function* fetchProductsWorker() {
    try {
        const response = yield call(fetchProducts);
        const data = yield response.json();

        if (response.ok) {
            yield put({ type: Type.GET_PRODUCTS_SUCCESS, payload: data });
        } else {
            yield put({ type: Type.GET_PRODUCTS_FAILURE, payload: data.message || 'Error fetching products.' });
        }
    } catch (error) {
        yield put({ type: Type.GET_PRODUCTS_FAILURE, payload: error.message });
    }
}

export function* watchProduct() {
    yield takeLatest(Type.GET_PRODUCTS_REQUEST, fetchProductsWorker); 
}