import { call, put, takeLatest } from 'redux-saga/effects';
import { fetchProducts, fetchPexelsImages } from '../api/product';
import * as Type from '../actions';

function* fetchProductsWorker() {
    yield put({ type: Type.GET_PRODUCTS_REQUEST});
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

export function* fetchPexelsImagesWorker(action) {
    yield put({ type: GET_PEXELS_IMAGES_REQUEST });
    try {
        const data = yield call(fetchPexelsImages, action.payload);
        
        const images = data.photos.map(photo => photo.src.large);
        
        yield put({ type: GET_PEXELS_IMAGES_COMPLETED, payload: images });
    } catch (error) {
        yield put({ type: GET_PEXELS_IMAGES_ERROR, payload: error.message });
    }
}

export function* fectchPexelsImagesWorker() {
    yield takeLatest(Type.GET_PEXELS_IMAGES, fetchPexelsImagesWorker);
}

export function* watchProduct() {
    yield takeLatest(Type.GET_PRODUCTS, fetchProductsWorker); 
}

export function* watchPexelsImages(){
    yield takeLatest(Type.GET_PEXELS_IMAGES, fetchPexelsImagesWorker)
}