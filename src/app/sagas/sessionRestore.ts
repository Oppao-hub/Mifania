import { call, put, select, takeLatest } from 'redux-saga/effects';
import { REHYDRATE } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Type from '../actions';
import { getNotifications } from '../api/notification';
import { isApiRequestError } from '../api/client';
import { clearExpiredStoredSession, resetStoredSessionSilently, suppressSessionLogoutFor } from '../../utils/authSession';
import { isJwtUsable } from '../../utils/jwtToken';
import { RootState } from '../../utils/types';

/** One-time cleanup: auth used to be duplicated in AsyncStorage root persist. */
function* removeLegacyRootAuthSnapshot(): Generator<any, void, any> {
  try {
    const raw = yield call([AsyncStorage, 'getItem'], 'persist:root');
    if (!raw) {
      return;
    }

    const parsed = JSON.parse(raw) as Record<string, string | undefined>;
    if (!parsed.authentication) {
      return;
    }

    delete parsed.authentication;
    yield call([AsyncStorage, 'setItem'], 'persist:root', JSON.stringify(parsed));
  } catch {
    // Non-fatal migration helper.
  }
}

function* validateRestoredSession(): Generator<any, void, any> {
  yield call(removeLegacyRootAuthSnapshot);

  if (clearExpiredStoredSession()) {
    yield put({ type: Type.SESSION_RESTORE_VALIDATED });
    return;
  }

  const token: string | undefined = yield select(
    (state: RootState) => state.authentication.data?.token,
  );

  if (!token) {
    yield put({ type: Type.SESSION_RESTORE_VALIDATED });
    return;
  }

  if (!isJwtUsable(token)) {
    resetStoredSessionSilently();
    yield put({ type: Type.SESSION_RESTORE_VALIDATED });
    return;
  }

  try {
    yield call(() => suppressSessionLogoutFor(() => getNotifications(token)));
    yield put({ type: Type.SESSION_RESTORE_VALIDATED });
  } catch (error: unknown) {
    if (isApiRequestError(error) && error.status === 401) {
      resetStoredSessionSilently();
    }

    yield put({ type: Type.SESSION_RESTORE_VALIDATED });
  }
}

export function* watchSessionRestore(): Generator<any, void, any> {
  yield takeLatest(REHYDRATE, validateRestoredSession);
}
