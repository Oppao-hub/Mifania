import { call, put, select, takeEvery } from 'redux-saga/effects';
import * as Type from '../actions';
import {
    clearNotifications,
    deleteNotification,
    getNotifications,
    markAllNotificationsRead,
    markNotificationRead,
} from '../api/notification';
import { isApiRequestError } from '../api/client';
import { formatFetchErrorMessage } from '../../utils/fetchError';
import { isUnauthorizedError } from '../../utils/authSession';
import { RootState } from '../../utils/types';

const selectAuthToken = (state: RootState) => state.authentication.data?.token;

function* getNotificationsSaga(action: { type: string, payload?: string }): Generator<any, void, any> {
    const tokenFromState: string | undefined = yield select(selectAuthToken);
    const token = action.payload || tokenFromState;
    if (!token) {
        return;
    }

    yield put({ type: Type.GET_NOTIFICATIONS_REQUEST });
    try {
        const data = yield call(getNotifications, token);
        yield put({ type: Type.GET_NOTIFICATIONS_COMPLETED, payload: data });
    } catch (e: unknown) {
        if (isUnauthorizedError(getNotificationErrorMessage(e))) {
            return;
        }
        if (isApiRequestError(e) && e.status === 404) {
            yield put({ type: Type.GET_NOTIFICATIONS_COMPLETED, payload: [] });
            return;
        }
        yield put({
            type: Type.GET_NOTIFICATIONS_ERROR,
            payload: formatFetchErrorMessage(e),
        });
    }
}

const getNotificationErrorMessage = (error: unknown): string => formatFetchErrorMessage(error);

function* clearNotificationsSaga(action: { type: string; payload?: { token?: string; ids?: number[] } }): Generator<any, void, any> {
    let token: string | undefined;
    try {
        const tokenFromState: string | undefined = yield select(selectAuthToken);
        token = action.payload?.token || tokenFromState;
        if (!token) return;

        yield call(clearNotifications, token);

        yield put({ type: Type.GET_NOTIFICATIONS });
    } catch (e: any) {
        if (isUnauthorizedError(e?.message)) return;
        if (token) {
            yield put({ type: Type.GET_NOTIFICATIONS });
        }
        yield put({ type: Type.GET_NOTIFICATIONS_ERROR, payload: e.message });
    }
}

function* markNotificationReadSaga(action: { type: string; payload?: { id?: number; token?: string } | number }): Generator<any, void, any> {
    try {
        const tokenFromState: string | undefined = yield select(
            (state: RootState) => state.authentication.data?.token,
        );

        const id = typeof action.payload === 'number'
            ? action.payload
            : Number(action.payload?.id);
        const token = typeof action.payload === 'number'
            ? tokenFromState
            : action.payload?.token || tokenFromState;

        if (!token || Number.isNaN(id)) return;

        yield call(markNotificationRead, id, token);
    } catch (e: any) {
        if (isUnauthorizedError(e?.message)) return;
        yield put({ type: Type.GET_NOTIFICATIONS_ERROR, payload: e.message });
    }
}

function* markAllNotificationsReadSaga(action: {
    type: string;
    payload?: { token?: string };
}): Generator<any, void, any> {
    try {
        const tokenFromState: string | undefined = yield select(selectAuthToken);
        const token = action.payload?.token || tokenFromState;
        if (!token) return;

        yield call(markAllNotificationsRead, token);
    } catch (e: any) {
        if (isUnauthorizedError(e?.message)) return;
        yield put({ type: Type.GET_NOTIFICATIONS_ERROR, payload: e.message });
    }
}

function* deleteNotificationSaga(action: {
    type: string;
    payload?: { id?: number; token?: string };
}): Generator<any, void, any> {
    try {
        const tokenFromState: string | undefined = yield select(selectAuthToken);
        const id = Number(action.payload?.id);
        const token = action.payload?.token || tokenFromState;

        if (!token || Number.isNaN(id)) return;

        yield call(deleteNotification, id, token);
    } catch (e: unknown) {
        if (isUnauthorizedError(getNotificationErrorMessage(e))) return;
        yield put({ type: Type.GET_NOTIFICATIONS });
    }
}

export function* watchNotification() {
    yield takeEvery(Type.GET_NOTIFICATIONS, getNotificationsSaga);
    yield takeEvery(Type.CLEAR_NOTIFICATIONS, clearNotificationsSaga);
    yield takeEvery(Type.MARK_NOTIFICATION_READ, markNotificationReadSaga);
    yield takeEvery(Type.MARK_ALL_NOTIFICATIONS_READ, markAllNotificationsReadSaga);
    yield takeEvery(Type.DELETE_NOTIFICATION, deleteNotificationSaga);
}
