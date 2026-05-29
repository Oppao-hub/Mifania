import { call, put, select, takeEvery } from 'redux-saga/effects';
import * as Type from '../actions';
import { getWishlistApi, toggleWishlistApi } from '../api/wishlist';
import { RootState, Product } from '../../utils/types';
import { showFeedbackToast } from '../../utils/feedbackToast';

const getToken = (state: RootState) => state.authentication.data?.token;

export function* getWishlistAsync(): Generator<any, void, any> {
    const token = yield select(getToken);
    if (!token) return;

    yield put({ type: Type.GET_WISHLIST_REQUEST });
    try {
        const items = yield call(getWishlistApi, token);
        yield put({ type: Type.GET_WISHLIST_COMPLETED, payload: items });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Failed to load wishlist';
        if (message === 'Unauthorized') {
            yield put({ type: Type.USER_LOGOUT });
        }
        yield put({ type: Type.GET_WISHLIST_ERROR, payload: message });
    }
}

export function* mergeGuestWishlistAsync(): Generator<any, void, any> {
    const token = yield select(getToken);
    if (!token) return;

    const localItems: Product[] = yield select((state: RootState) => state.wishlist.items);

    yield put({ type: Type.GET_WISHLIST_REQUEST });
    try {
        const serverItems: Product[] = yield call(getWishlistApi, token);
        const serverIds = new Set(serverItems.map((item) => item.id));

        const itemsToUpload = localItems.filter(
            (item) => item.id != null && !serverIds.has(item.id),
        );

        for (const product of itemsToUpload) {
            try {
                yield call(toggleWishlistApi, product.id!, token);
            } catch (error) {
                console.log('⚠️ Failed to merge wishlist item:', product.id, error);
            }
        }

        const finalItems =
            itemsToUpload.length > 0
                ? yield call(getWishlistApi, token)
                : serverItems;

        yield put({ type: Type.GET_WISHLIST_COMPLETED, payload: finalItems });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Failed to sync wishlist';
        if (message === 'Unauthorized') {
            yield put({ type: Type.USER_LOGOUT });
        }
        yield put({ type: Type.GET_WISHLIST_ERROR, payload: message });
    }
}

export function* toggleWishlistAsync(action: {
    type: string;
    payload: Product;
}): Generator<any, void, any> {
    const token = yield select(getToken);
    const product = action.payload;

    if (!token) {
        yield put({ type: Type.TOGGLE_WISHLIST_LOCAL, payload: product });
        return;
    }

    yield put({ type: Type.TOGGLE_WISHLIST_REQUEST });
    try {
        const result = yield call(toggleWishlistApi, product.id, token);
        yield put({ type: Type.TOGGLE_WISHLIST_COMPLETED, payload: result });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Failed to update wishlist';
        if (message === 'Unauthorized') {
            yield put({ type: Type.USER_LOGOUT });
        } else {
            showFeedbackToast("Couldn't update wishlist", 'error');
        }
        yield put({ type: Type.TOGGLE_WISHLIST_ERROR, payload: message });
    }
}

export function* watchWishlist() {
    yield takeEvery(Type.GET_WISHLIST, getWishlistAsync);
    yield takeEvery(Type.MERGE_GUEST_WISHLIST, mergeGuestWishlistAsync);
    yield takeEvery(Type.TOGGLE_WISHLIST, toggleWishlistAsync);
}
