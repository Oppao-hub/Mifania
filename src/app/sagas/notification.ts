import { call, put, takeEvery } from 'redux-saga/effects';
import * as Type from '../actions';
import { getNotifications } from '../api/notification';

function* getNotificationsSaga(action: { type: string, payload: string }): Generator<any, void, any> {
    yield put({ type: Type.GET_NOTIFICATIONS_REQUEST });
    try {
        const data = yield call(getNotifications, action.payload);
        yield put({ type: Type.GET_NOTIFICATIONS_COMPLETED, payload: data });
    } catch (e: any) {
        yield put({ type: Type.GET_NOTIFICATIONS_ERROR, payload: e.message });
    }
}

export function* watchNotification() {
    yield takeEvery(Type.GET_NOTIFICATIONS, getNotificationsSaga);
}
