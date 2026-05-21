import { takeEvery, call, put, select } from 'redux-saga/effects';
import { getOrdersApi, createOrderApi } from '../api/order';
import * as Type from '../../app/actions';
import { RootState } from '../../utils/types';

const getToken = (state: RootState) => state.authentication.data?.token;

export function* getOrdersAsync(action: { type: string; payload: string }): Generator<any, void, any> {
  let token = action.payload;
  
  if (!token) {
    token = yield select(getToken);
  }
  
  if (!token) return;

  yield put({ type: Type.GET_ORDERS_REQUEST });
  try {
    const data = yield call(getOrdersApi, token);
    yield put({ type: Type.GET_ORDERS_COMPLETED, payload: data });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "An unknown error occurred";
    yield put({ type: Type.GET_ORDERS_ERROR, payload: message });
  }
}

export function* createOrderAsync(action: { type: string; payload: { data: any; token: string } }): Generator<any, void, any> {
  yield put({ type: Type.CREATE_ORDER_REQUEST });
  try {
    const data = yield call(createOrderApi, action.payload.data, action.payload.token);
    yield put({ type: Type.CREATE_ORDER_COMPLETED, payload: data });
    
    // Clear the cart after successful order
    yield put({ type: Type.CLEAR_CART });
    
    // Refresh orders after creation
    yield put({ type: Type.GET_ORDERS, payload: action.payload.token });

    console.log("✅ Order created successfully:", data.id);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "An unknown error occurred";
    yield put({ type: Type.CREATE_ORDER_ERROR, payload: message });
  }
}

export function* watchOrder() {
  yield takeEvery(Type.GET_ORDERS, getOrdersAsync);
  yield takeEvery(Type.CREATE_ORDER, createOrderAsync);
}
