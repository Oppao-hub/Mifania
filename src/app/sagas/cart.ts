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
import { RootState, Product } from '../../utils/types';
import { findProductVariant } from '../../utils/productVariants';
import { showFeedbackToast } from '../../utils/feedbackToast';

// Selector to get token
const getToken = (state: RootState) => state.authentication.data?.token;

export function* getCartAsync(): Generator<any, void, any> {
    const token = yield select(getToken);
    if (!token) return;

    yield put({ type: Type.GET_CART_REQUEST });
    try {
        const data = yield call(getCartApi, token);
        const products = yield select((state: RootState) => state.product.items);
        console.log("🛒 Cart API Response synchronized with products");
        yield put({ type: Type.GET_CART_COMPLETED, payload: { data, products } });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "An unknown error occurred";
        if (message === "Unauthorized") {
            yield put({ type: Type.USER_LOGOUT });
        }
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
        if (message === "Unauthorized") {
            yield put({ type: Type.USER_LOGOUT });
        }
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
        if (message === "Unauthorized") {
            yield put({ type: Type.USER_LOGOUT });
        }
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
        if (message === "Unauthorized") {
            yield put({ type: Type.USER_LOGOUT });
        }
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
        if (message === "Unauthorized") {
            yield put({ type: Type.USER_LOGOUT });
        }
        yield put({ type: Type.DELETE_COLLECTION_ERROR, payload: message });
    }
}

export function* addToCartAsync(action: { type: string; payload: any }): Generator<any, void, any> {
    const token = yield select(getToken);
    if (!token) {
        yield put({ type: Type.ADD_TO_CART_ERROR, payload: "Please log in to add items to your cart." });
        return;
    }

    yield put({ type: Type.ADD_TO_CART_REQUEST });
    try {
        yield call(addToCartApi, action.payload.productId, action.payload.quantity, token);
        yield put({ type: Type.ADD_TO_CART_COMPLETED });
        // Refresh cart after adding
        yield call(getCartAsync);
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "An unknown error occurred";
        if (message === "Unauthorized") {
            yield put({ type: Type.USER_LOGOUT });
        }
        yield put({ type: Type.ADD_TO_CART_ERROR, payload: message });
    }
}

export function* editCartItemAsync(action: { type: string; payload: any }): Generator<any, void, any> {
    const token = yield select(getToken);
    if (!token) return;

    const { cartItemId, quantity, size, color } = action.payload;
    const cartItems = yield select((state: RootState) => state.cart.items);
    const products: Product[] = yield select((state: RootState) => state.product.items);

    const cartItem = cartItems.find((item: { id?: string | number }) => String(item.id) === String(cartItemId));
    if (!cartItem || typeof cartItem.product !== 'object') {
        yield put({ type: Type.EDIT_CART_ITEM_ERROR, payload: 'Cart item not found.' });
        return;
    }

    const currentProduct = cartItem.product;
    const variantUnchanged = currentProduct.size === size && currentProduct.color === color;

    yield put({ type: Type.EDIT_CART_ITEM_REQUEST });

    try {
        if (variantUnchanged) {
            yield call(updateCartItemApi, cartItemId, quantity, token);
        } else {
            const variantProduct = findProductVariant(products, currentProduct, size, color);
            if (!variantProduct?.id) {
                yield put({
                    type: Type.EDIT_CART_ITEM_ERROR,
                    payload: 'This size and color combination is not available.',
                });
                return;
            }
            yield call(deleteCartItemApi, cartItemId, token);
            yield call(addToCartApi, variantProduct.id, quantity, token);
        }
        yield put({ type: Type.EDIT_CART_ITEM_COMPLETED });
        yield call(getCartAsync);
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'An unknown error occurred';
        if (message === 'Unauthorized') {
            yield put({ type: Type.USER_LOGOUT });
        }
        yield put({ type: Type.EDIT_CART_ITEM_ERROR, payload: message });
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
        if (message === "Unauthorized") {
            yield put({ type: Type.USER_LOGOUT });
        }
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
        showFeedbackToast('Removed from Cart!');
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "An unknown error occurred";
        if (message === "Unauthorized") {
            yield put({ type: Type.USER_LOGOUT });
        }
        yield put({ type: Type.REMOVE_FROM_CART_ERROR, payload: message });
        showFeedbackToast("Couldn't remove item from cart", 'error');
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
    yield takeEvery(Type.EDIT_CART_ITEM, editCartItemAsync);
    yield takeEvery(Type.REMOVE_FROM_CART, removeFromCartAsync);
}
