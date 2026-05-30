import { call, put, select, takeEvery } from 'redux-saga/effects';
import * as Type from '../actions';
import { RootState } from '../../utils/types';
import { getCustomerRefFromUser } from '../../utils/apiResource';
import type { RealtimeRefreshPayload } from '../../utils/realtimeRefresh';

export type { RealtimeRefreshPayload };

function normalizeEntity(entity?: string): string {
  return String(entity || '').toLowerCase();
}

function resolveOrderId(payload: RealtimeRefreshPayload): string {
  if (payload.orderId != null) {
    return String(payload.orderId);
  }

  const entity = normalizeEntity(payload.entity);
  if (entity.includes('order') && payload.entityId != null) {
    return String(payload.entityId);
  }

  return '';
}

export function* applyRealtimeRefresh(payload: RealtimeRefreshPayload = {}): Generator<any, void, any> {
  const auth = yield select((state: RootState) => state.authentication);
  const token: string | undefined = auth?.data?.token;
  if (!token || !auth?.sessionValidated) {
    return;
  }

  const authUser = yield select((state: RootState) => state.authentication.data?.user);
  const customerRef = getCustomerRefFromUser(authUser);

  const entity = normalizeEntity(payload.entity);
  const orderId = resolveOrderId(payload);
  const isDeleted = payload.action === 'deleted';

  if (__DEV__) {
    console.log('[realtime] refresh', { entity, action: payload.action, orderId });
  }

  yield put({ type: Type.GET_NOTIFICATIONS });

  if (entity === 'bootstrap' || payload.action === 'connected') {
    yield put({ type: Type.GET_PRODUCTS });
    yield put({ type: Type.GET_CATEGORIES });
    yield put({ type: Type.GET_SUB_CATEGORIES });
    yield put({ type: Type.GET_ORDERS, payload: token });
    yield put({ type: Type.GET_CART });
    yield put({ type: Type.GET_WISHLIST });
    if (customerRef) {
      yield put({ type: Type.GET_WALLET, payload: { id: customerRef, token } });
    }
    return;
  }

  if (entity.includes('order') || orderId) {
    yield put({ type: Type.GET_ORDERS, payload: token });
    yield put({ type: Type.GET_CART });

    if (orderId && !isDeleted) {
      yield put({
        type: Type.GET_ORDER_DETAILS,
        payload: { id: `/api/orders/${orderId}`, token },
      });
    }
  }

  if (
    entity.includes('product') ||
    entity.includes('stock') ||
    entity.includes('category') ||
    entity.includes('sub_category') ||
    entity.includes('story') ||
    entity.includes('review')
  ) {
    yield put({ type: Type.GET_PRODUCTS });
    yield put({ type: Type.GET_CATEGORIES });
    yield put({ type: Type.GET_SUB_CATEGORIES });
    yield put({ type: Type.GET_COLLECTIONS });
  }

  if (entity.includes('wishlist')) {
    yield put({ type: Type.GET_WISHLIST });
  }

  if (entity.includes('cart')) {
    yield put({ type: Type.GET_CART });
  }

  if (entity.includes('wallet') || entity.includes('redemption') || entity.includes('reward')) {
    if (customerRef) {
      yield put({ type: Type.GET_WALLET, payload: { id: customerRef, token } });
    }
    yield put({ type: Type.GET_REWARDS });
    yield put({ type: Type.GET_REDEMPTIONS });
  }

  if (entity.includes('customer') || entity.includes('address') || entity.includes('payment_method')) {
    if (customerRef) {
      yield put({ type: Type.GET_CUSTOMER, payload: { id: customerRef, token } });
    }
    yield put({ type: Type.GET_ADDRESSES });
  }

  if (entity.includes('admin') || entity.includes('staff') || entity.includes('qr')) {
    yield put({ type: Type.GET_NOTIFICATIONS });
  }
}

function* handleRealtimeRefresh(action: { payload?: RealtimeRefreshPayload }): Generator<any, void, any> {
  yield call(applyRealtimeRefresh, action.payload || {});
}

export function* watchRealtimeRefresh(): Generator<any, void, any> {
  yield takeEvery(Type.SOCKET_REALTIME_REFRESH, handleRealtimeRefresh);
}
