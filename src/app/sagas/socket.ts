import { take, call, cancel, fork, delay, select } from 'redux-saga/effects';
import { REHYDRATE } from 'redux-persist';
import * as Type from '../actions';
import { setupSocket, disconnectSocket } from '../../services/socket';
import { isJwtUsable } from '../../utils/jwtToken';
import { RootState } from '../../utils/types';

function* getSocketCredentials(): Generator<any, { token: string; userId: string | number } | null, any> {
  const auth = yield select((state: RootState) => state.authentication);
  const token = auth?.data?.token;
  const userId = auth?.data?.user?.id;
  if (!token || userId == null || !auth.sessionValidated || !isJwtUsable(token)) {
    return null;
  }
  return { token: String(token), userId };
}

function* handleSocketLifecycle(_authToken: string, userId: string | number): Generator<any, void, any> {
  try {
    yield call(setupSocket, _authToken, String(userId));
    yield delay(Number.MAX_SAFE_INTEGER);
  } finally {
    yield call(disconnectSocket);
    console.log('Socket channel closed');
  }
}

export function* watchSocket(): Generator<any, void, any> {
  let socketTask: any = null;

  const connectIfAuthenticated = function* (): Generator<any, void, any> {
    const credentials = yield call(getSocketCredentials);
    if (!credentials) {
      return;
    }

    if (socketTask) {
      yield cancel(socketTask);
    }

    console.log('Setting up socket for user', credentials.userId);
    socketTask = yield fork(handleSocketLifecycle, credentials.token, credentials.userId);
  };

  yield take(REHYDRATE);

  while (true) {
    yield take([
      Type.USER_LOGIN_COMPLETED,
      Type.SESSION_RESTORE_VALIDATED,
      Type.SOCKET_ENSURE_CONNECTED,
      REHYDRATE,
    ]);
    yield call(connectIfAuthenticated);
  }
}
