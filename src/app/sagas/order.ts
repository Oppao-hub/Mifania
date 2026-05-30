import { takeEvery, call, put, select, fork } from 'redux-saga/effects';
import { cancelOrderApi, deleteOrderApi, getOrdersApi, createOrderApi, getOrderDetailsApi } from '../api/order';
import { addToCartApi, getCartApi } from '../api/cart';
import { getWalletApi } from '../api/wallet';
import { formatFetchErrorMessage } from '../../utils/fetchError';
import * as Type from '../../app/actions';
import { Order, RootState } from '../../utils/types';
import { getCustomerRefFromUser } from '../../utils/apiResource';
import { getReorderLineItems } from '../../utils/orderActions';
import { normalizeOrderStatus } from '../../utils/orderPresentation';
import { showFeedbackToast, showBlockingError } from '../../utils/userFeedback';
import { beginSuppressedSessionLogout, endSuppressedSessionLogout } from '../../utils/authSession';
import { getCartAsync } from './cart';
const getToken = (state: RootState) => state.authentication.data?.token;

function* refreshAfterOrderCreated(token: string, customerRef: string | null): Generator<any, void, any> {
  beginSuppressedSessionLogout();
  try {
    const orders = yield call(getOrdersApi, token);
    yield put({ type: Type.GET_ORDERS_COMPLETED, payload: orders });

    if (customerRef) {
      const wallet = yield call(getWalletApi, customerRef, token);
      yield put({ type: Type.GET_WALLET_COMPLETED, payload: wallet });
    }

    const cartData = yield call(getCartApi, token);
    const products = yield select((state: RootState) => state.product.items);
    yield put({ type: Type.GET_CART_COMPLETED, payload: { data: cartData, products } });
  } catch (error: unknown) {
    console.log('Post-order refresh skipped:', error instanceof Error ? error.message : error);
  } finally {
    endSuppressedSessionLogout();
  }
}

export function* getOrdersAsync(action: { type: string; payload: string }): Generator<any, void, any> {
  let token = action.payload;
  
  if (!token) {
    token = yield select(getToken);
  }
  
  if (!token) {
    console.log("⚠️ No token found for fetching orders");
    return;
  }

  yield put({ type: Type.GET_ORDERS_REQUEST });
  try {
    console.log("📡 Fetching orders...");
    const data = yield call(getOrdersApi, token);
    console.log("✅ Orders fetched successfully. Count:", data.length);
    if (data.length > 0) {
        console.log("🔍 Sample Order from API:", JSON.stringify(data[0]).substring(0, 300));
    }
    yield put({ type: Type.GET_ORDERS_COMPLETED, payload: data });
  } catch (error: unknown) {
    console.log("❌ Fetch Orders Saga Error:", error);
    const message = error instanceof Error ? error.message : "An unknown error occurred";
    if (message === "Unauthorized") {
        yield put({ type: Type.USER_LOGOUT });
    }
    yield put({ type: Type.GET_ORDERS_ERROR, payload: message });
  }
}

export function* getOrderDetailsAsync(action: { type: string; payload: { id: string | number, token?: string } }): Generator<any, void, any> {
  let token = action.payload.token;
  
  if (!token) {
    token = yield select(getToken);
  }
  
  if (!token) return;

  yield put({ type: Type.GET_ORDER_DETAILS_REQUEST });
  try {
    const data = yield call(getOrderDetailsApi, action.payload.id, token);
    yield put({ type: Type.GET_ORDER_DETAILS_COMPLETED, payload: data });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "An unknown error occurred";
    if (message === "Unauthorized") {
        yield put({ type: Type.USER_LOGOUT });
    }
    yield put({ type: Type.GET_ORDER_DETAILS_ERROR, payload: message });
  }
}

export function* createOrderAsync(action: {
  type: string;
  payload: { data: any; token: string; idempotencyKey?: string };
}): Generator<any, void, any> {
  yield put({ type: Type.CREATE_ORDER_REQUEST });
  try {
    const data = yield call(
      createOrderApi,
      action.payload.data,
      action.payload.token,
      action.payload.idempotencyKey,
    );
    yield put({ type: Type.CREATE_ORDER_COMPLETED, payload: data });

    const selectedItems = yield select((state: RootState) =>
      state.cart.items.filter((item) => item.selected),
    );
    const purchasedCartItemIds = selectedItems
      .map((item) => item.id)
      .filter((id): id is string | number => id != null);

    if (purchasedCartItemIds.length > 0) {
      yield put({ type: Type.REMOVE_PURCHASED_CART_ITEMS, payload: purchasedCartItemIds });
    }

    const authData = yield select((state: RootState) => state.authentication.data);
    const customerRef = getCustomerRefFromUser(authData?.user);
    yield fork(refreshAfterOrderCreated, action.payload.token, customerRef ?? null);

    console.log("✅ Order created successfully:", data.id);
  } catch (error: unknown) {
    console.log("❌ Order Creation Failed:", error);
    if (__DEV__) {
      console.log("📦 Order payload:", JSON.stringify(action.payload.data));
    }
    const message = error instanceof Error ? error.message : "An unknown error occurred";
    if (message === "Unauthorized") {
        yield put({ type: Type.USER_LOGOUT });
    }
    yield put({ type: Type.CREATE_ORDER_ERROR, payload: message });
  }
}

export function* cancelOrderAsync(action: {
  type: string;
  payload: { orderId: number | string; token?: string; suppressToast?: boolean };
}): Generator<any, void, any> {
  let token = action.payload.token;
  if (!token) {
    token = yield select(getToken);
  }
  if (!token) return;

  yield put({ type: Type.CANCEL_ORDER_REQUEST });
  try {
    const result = yield call(cancelOrderApi, action.payload.orderId, token);
    yield put({
      type: Type.CANCEL_ORDER_COMPLETED,
      payload: {
        id: action.payload.orderId,
        orderStatus: result.orderStatus,
      },
    });
    yield put({ type: Type.GET_ORDERS, payload: token });
    if (!action.payload.suppressToast) {
      showFeedbackToast('Order Cancelled');
    }
  } catch (error: unknown) {
    try {
      const order = yield call(getOrderDetailsApi, action.payload.orderId, token);
      if (normalizeOrderStatus(order?.orderStatus) === 'cancelled') {
        yield put({
          type: Type.CANCEL_ORDER_COMPLETED,
          payload: {
            id: action.payload.orderId,
            orderStatus: order.orderStatus,
          },
        });
        yield put({ type: Type.GET_ORDERS, payload: token });
        if (!action.payload.suppressToast) {
          showFeedbackToast('Order Cancelled');
        }
        return;
      }
    } catch {
      // Fall through to the standard error path below.
    }

    const message = error instanceof Error ? error.message : 'Could not cancel order';
    if (message === 'Unauthorized') {
      yield put({ type: Type.USER_LOGOUT });
    }
    yield put({ type: Type.CANCEL_ORDER_ERROR, payload: message });
    if (action.payload.suppressToast) {
      return;
    }
    showBlockingError({
      title: 'Could not cancel order',
      message,
    });
  }
}

export function* deleteOrderAsync(action: {
  type: string;
  payload: { orderId: number | string; token?: string; suppressToast?: boolean };
}): Generator<any, void, any> {
  let token = action.payload.token;
  if (!token) {
    token = yield select(getToken);
  }
  if (!token) return;

  yield put({ type: Type.DELETE_ORDER_REQUEST });
  try {
    yield call(deleteOrderApi, action.payload.orderId, token);
    yield put({
      type: Type.DELETE_ORDER_COMPLETED,
      payload: { id: action.payload.orderId },
    });
    if (!action.payload.suppressToast) {
      showFeedbackToast('Order deleted');
    }
  } catch (error: unknown) {
    const message = formatFetchErrorMessage(error);
    if (message.toLowerCase().includes('unauthorized')) {
      yield put({ type: Type.USER_LOGOUT });
    }
    yield put({ type: Type.DELETE_ORDER_ERROR, payload: message });
    if (action.payload.suppressToast) {
      return;
    }
    showBlockingError({
      title: 'Could not delete order',
      message,
    });
  }
}

export function* reorderOrderAsync(action: {
  type: string;
  payload: { order: Order; token?: string };
}): Generator<any, void, any> {
  let token = action.payload.token;
  if (!token) {
    token = yield select(getToken);
  }
  if (!token) {
    yield put({ type: Type.REORDER_ORDER_ERROR, payload: 'Please log in to reorder items.' });
    return;
  }

  let lineItems = getReorderLineItems(action.payload.order);

  if (lineItems.length === 0 && action.payload.order.id != null) {
    try {
      const details = yield call(getOrderDetailsApi, action.payload.order.id, token);
      lineItems = getReorderLineItems(details);
    } catch {
      // fall through to empty check
    }
  }

  if (lineItems.length === 0) {
    yield put({
      type: Type.REORDER_ORDER_ERROR,
      payload: 'No items found to add back to your cart.',
    });
    return;
  }

  yield put({ type: Type.REORDER_ORDER_REQUEST });
  try {
    for (const line of lineItems) {
      yield call(addToCartApi, line.productId, line.quantity, token);
    }
    yield put({ type: Type.REORDER_ORDER_COMPLETED, payload: { count: lineItems.length } });
    yield call(getCartAsync);
    showFeedbackToast(
      lineItems.length === 1 ? 'Item added to cart' : `${lineItems.length} items added to cart`,
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Could not reorder items';
    if (message === 'Unauthorized') {
      yield put({ type: Type.USER_LOGOUT });
    }
    yield put({ type: Type.REORDER_ORDER_ERROR, payload: message });
    showBlockingError({
      title: 'Could not reorder',
      message,
    });
  }
}

export function* watchOrder() {
  yield takeEvery(Type.GET_ORDERS, getOrdersAsync);
  yield takeEvery(Type.GET_ORDER_DETAILS, getOrderDetailsAsync);
  yield takeEvery(Type.CREATE_ORDER, createOrderAsync);
  yield takeEvery(Type.CANCEL_ORDER, cancelOrderAsync);
  yield takeEvery(Type.DELETE_ORDER, deleteOrderAsync);
  yield takeEvery(Type.REORDER_ORDER, reorderOrderAsync);
}
