import { call, put, takeLatest } from 'redux-saga/effects';
import { fetchCategories } from '../api/category';
import * as Type from '../actions';

function* fetchCategoriesWorker(): Generator<any, void, any> {
    yield put({ type: Type.GET_CATEGORIES_REQUEST});
    try {
        const response = yield call(fetchCategories);
        const data = yield response.json();

        if (response.ok) {
            // Robust check: handle flat array OR object with member/data key
            const categories = Array.isArray(data) ? data : (data.member || data.data || []);
            yield put({ type: Type.GET_CATEGORIES_COMPLETED, payload: categories });
        } else {
            yield put({ type: Type.GET_CATEGORIES_ERROR, payload: data.message || 'Error fetching categories.' });
        }
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "An unknown error occurred";
        yield put({ type: Type.GET_CATEGORIES_ERROR, payload: message });
    }
}

export function* watchCategory() {
    yield takeLatest(Type.GET_CATEGORIES, fetchCategoriesWorker); 
}