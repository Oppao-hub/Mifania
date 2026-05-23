import { takeEvery, call, put, select } from 'redux-saga/effects';
import { getOrdersApi, createOrderApi, getOrderDetailsApi } from '../api/order';
import * as Type from '../../app/actions';
import { RootState } from '../../utils/types';
import { getCustomerRefFromUser } from '../../utils/apiResource';
import { navigate } from '../../utils/navigation';
import { ROUTES } from '../../utils';

const getToken = (state: RootState) => state.authentication.data?.token;

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

export function* createOrderAsync(action: { type: string; payload: { data: any; token: string } }): Generator<any, void, any> {
  yield put({ type: Type.CREATE_ORDER_REQUEST });
  try {
    const data = yield call(createOrderApi, action.payload.data, action.payload.token);
    yield put({ type: Type.CREATE_ORDER_COMPLETED, payload: data });
    
    // 1. Clear the cart state locally
    yield put({ type: Type.CLEAR_CART });
    
    // 2. Refresh orders after creation
    yield put({ type: Type.GET_ORDERS, payload: action.payload.token });

    // 3. Refresh Wallet (Reward Points) and Active Cart from Server
    const authData = yield select((state: RootState) => state.authentication.data);
    const customerRef = getCustomerRefFromUser(authData?.user);
    if (customerRef) {
        yield put({ type: Type.GET_WALLET, payload: { id: customerRef, token: action.payload.token } });
    }
    yield put({ type: Type.GET_CART });

    console.log("✅ Order created successfully:", data.id);
    
    // Navigate to success screen with points earned
    // data.totalPoints is expected from the backend as per instructions
    yield call(navigate, ROUTES.ORDER_SUCCESS, { pointsEarned: data.totalPoints || 0 });
  } catch (error: unknown) {
    console.log("❌ Order Creation Failed:", error);
    const message = error instanceof Error ? error.message : "An unknown error occurred";
    if (message === "Unauthorized") {
        yield put({ type: Type.USER_LOGOUT });
    }
    yield put({ type: Type.CREATE_ORDER_ERROR, payload: message });
  }
}

export function* watchOrder() {
  yield takeEvery(Type.GET_ORDERS, getOrdersAsync);
  yield takeEvery(Type.GET_ORDER_DETAILS, getOrderDetailsAsync);
  yield takeEvery(Type.CREATE_ORDER, createOrderAsync);
}
