import { call, put, takeLatest } from 'redux-saga/effects';
import { fetchSubCategories } from '../api/subCategory';
import * as Type from '../actions';

function* fetchSubCategoriesWorker(): Generator<any, void, any> {
    yield put({ type: Type.GET_SUB_CATEGORIES_REQUEST});
    try {
        const data = yield call(fetchSubCategories);
        const subCategories = Array.isArray(data) ? data : (data.member || data.data ||[]);
        yield put({ type: Type.GET_SUB_CATEGORIES_COMPLETED, payload: subCategories });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "An unknown error occurred";
        yield put({ type: Type.GET_SUB_CATEGORIES_ERROR, payload: message });
    }
}

export function* watchSubCategory() {
    yield takeLatest(Type.GET_SUB_CATEGORIES, fetchSubCategoriesWorker); 
}