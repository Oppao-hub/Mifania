import { takeEvery, call, put } from 'redux-saga/effects';
import { getCustomerApi, updateCustomerApi } from '../api/customer';
import * as Type from '../../app/actions';

export function* getCustomerAsync(action: { type: string; payload: { id: number; token: string } }): Generator<any, void, any> {
  yield put({ type: Type.GET_CUSTOMER_REQUEST });
  try {
    const data = yield call(getCustomerApi, action.payload.id, action.payload.token);
    yield put({ type: Type.GET_CUSTOMER_COMPLETED, payload: data });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "An unknown error occurred";
    yield put({ type: Type.GET_CUSTOMER_ERROR, payload: message });
  }
}

export function* updateCustomerAsync(action: { type: string; payload: { id: number; data: any; token: string } }): Generator<any, void, any> {
  yield put({ type: Type.UPDATE_CUSTOMER_REQUEST });
  try {
    const data = yield call(updateCustomerApi, action.payload.id, action.payload.data, action.payload.token);
    yield put({ type: Type.UPDATE_CUSTOMER_COMPLETED, payload: data });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "An unknown error occurred";
    yield put({ type: Type.UPDATE_CUSTOMER_ERROR, payload: message });
  }
}

export function* watchCustomer() {
  yield takeEvery(Type.GET_CUSTOMER, getCustomerAsync);
  yield takeEvery(Type.UPDATE_CUSTOMER, updateCustomerAsync);
}
