import { call, put, takeLatest } from 'redux-saga/effects';
import { fetchProducts } from '../api/product';
import * as Type from '../actions';
import { formatFetchErrorMessage } from '../../utils/fetchError';

function* fetchProductsWorker(): Generator<any, void, any> {
    yield put({ type: Type.GET_PRODUCTS_REQUEST});
    try {
        const data = yield call(fetchProducts);
        const products = Array.isArray(data) ? data : (data['hydra:member'] || data.member || data.data || []);
        yield put({ type: Type.GET_PRODUCTS_COMPLETED, payload: products});
    } catch (error: unknown) {
        yield put({ type: Type.GET_PRODUCTS_ERROR, payload: formatFetchErrorMessage(error) });
    }
}

export function* watchProduct() {
    yield takeLatest(Type.GET_PRODUCTS, fetchProductsWorker); 
}