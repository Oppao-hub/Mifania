import { takeEvery, call, put } from 'redux-saga/effects';
import { getWalletApi } from '../api/wallet';
import { getRewardsApi } from '../api/reward';
import { getRedemptionsApi, createRedemptionApi } from '../api/redemption';
import * as Type from '../../app/actions';

export function* getWalletAsync(action: { type: string; payload: { id: number; token: string } }): Generator<any, void, any> {
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

export function* createRedemptionAsync(action: { type: string; payload: { rewardIri: string; token: string } }): Generator<any, void, any> {
  yield put({ type: Type.CREATE_REDEMPTION_REQUEST });
  try {
    const data = yield call(createRedemptionApi, action.payload.rewardIri, action.payload.token);
    yield put({ type: Type.CREATE_REDEMPTION_COMPLETED, payload: data });
    // Refresh wallet after redemption
    // Note: We'd need the wallet ID here, but usually the customer info contains it.
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "An unknown error occurred";
    yield put({ type: Type.CREATE_REDEMPTION_ERROR, payload: message });
  }
}

export function* watchLoyalty() {
  yield takeEvery(Type.GET_WALLET, getWalletAsync);
  yield takeEvery(Type.GET_REWARDS, getRewardsAsync);
  yield takeEvery(Type.GET_REDEMPTIONS, getRedemptionsAsync);
  yield takeEvery(Type.CREATE_REDEMPTION, createRedemptionAsync);
}
