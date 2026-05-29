import { takeEvery, call, put, select } from 'redux-saga/effects';
import { getWalletApi } from '../api/wallet';
import { getRewardsApi } from '../api/reward';
import { getRedemptionsApi, createRedemptionApi } from '../api/redemption';
import { getCustomerRefFromUser } from '../../utils/apiResource';
import * as Type from '../../app/actions';

export function* getWalletAsync(action: { type: string; payload: { id: string | number; token: string } }): Generator<any, void, any> {
  yield put({ type: Type.GET_WALLET_REQUEST });
  try {
    const data = yield call(getWalletApi, action.payload.id, action.payload.token);
    yield put({ type: Type.GET_WALLET_COMPLETED, payload: data });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "An unknown error occurred";
    yield put({ type: Type.GET_WALLET_ERROR, payload: message });
  }
}

export function* getRewardsAsync(action: { type: string; payload: string }): Generator<any, void, any> {
  yield put({ type: Type.GET_REWARDS_REQUEST });
  try {
    const data = yield call(getRewardsApi, action.payload);
    yield put({ type: Type.GET_REWARDS_COMPLETED, payload: data });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "An unknown error occurred";
    yield put({ type: Type.GET_REWARDS_ERROR, payload: message });
  }
}

export function* getRedemptionsAsync(action: { type: string; payload: string }): Generator<any, void, any> {
  yield put({ type: Type.GET_REDEMPTIONS_REQUEST });
  try {
    const data = yield call(getRedemptionsApi, action.payload);
    yield put({ type: Type.GET_REDEMPTIONS_COMPLETED, payload: data });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "An unknown error occurred";
    yield put({ type: Type.GET_REDEMPTIONS_ERROR, payload: message });
  }
}

export function* createRedemptionAsync(action: { type: string; payload: { rewardIri: string; token: string, pointsCost?: number } }): Generator<any, void, any> {
  yield put({ type: Type.CREATE_REDEMPTION_REQUEST, payload: { pointsCost: action.payload.pointsCost } });
  try {
    const data = yield call(createRedemptionApi, action.payload.rewardIri, action.payload.token);
    yield put({ type: Type.CREATE_REDEMPTION_COMPLETED, payload: data });

    const authData = yield select((state: { authentication: { data?: { token?: string; user?: unknown } } }) => state.authentication.data);
    const customerRef = getCustomerRefFromUser(authData?.user as any);
    if (customerRef && authData?.token) {
      yield put({ type: Type.GET_WALLET, payload: { id: customerRef, token: authData.token } });
    }
    yield put({ type: Type.GET_REDEMPTIONS, payload: action.payload.token });
    yield put({ type: Type.GET_REWARDS, payload: action.payload.token });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "An unknown error occurred";
    yield put({ type: Type.CREATE_REDEMPTION_ERROR, payload: { message, pointsCost: action.payload.pointsCost } });
  }
}

export function* watchWallet() {
  yield takeEvery(Type.GET_WALLET, getWalletAsync);
  yield takeEvery(Type.GET_REWARDS, getRewardsAsync);
  yield takeEvery(Type.GET_REDEMPTIONS, getRedemptionsAsync);
  yield takeEvery(Type.CREATE_REDEMPTION, createRedemptionAsync);
}
