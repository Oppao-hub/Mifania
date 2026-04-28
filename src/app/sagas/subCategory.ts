import { call, put, takeLatest } from 'redux-saga/effects';
import { fetchSubCategories } from '../api/subCategory';
import * as Type from '../actions';

function* fetchSubCategoriesWorker(): Generator<any, void, any> {
    yield put({ type: Type.GET_SUB_CATEGORIES_REQUEST});
    try {
        const response = yield call(fetchSubCategories);
        const data = yield response.json();

        if (response.ok) {
            yield put({ type: Type.GET_SUB_CATEGORIES_COMPLETED, payload: data });
        } else {
            yield put({ type: Type.GET_SUB_CATEGORIES_ERROR, payload: data.message || 'Error fetching sub categories.' });
        }
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "An unknown error occurred";
        yield put({ type: Type.GET_SUB_CATEGORIES_ERROR, payload: message });
    }
}

export function* watchSubCategory() {
    yield takeLatest(Type.GET_SUB_CATEGORIES, fetchSubCategoriesWorker); 
}