import { take, call, cancel, put, fork, select } from 'redux-saga/effects';
import { eventChannel } from 'redux-saga';
import * as Type from '../actions';
import { setupSocket } from '../../services/socket';
import { RootState } from '../../utils/types';

function* handleSocketLifecycle(authToken: string, userId: string | number): Generator<any, void, any> {
  try {
    const channel = yield call(function(): any {
      return eventChannel(emit => {
        // Pass both authToken and userId to setupSocket
        const s = setupSocket(authToken, String(userId), (action) => {
          emit(action);
        });
        return () => {
          s.disconnect();
        };
      });
    });

    while (true) {
      const action: { type: string; payload?: any } = yield take(channel);
      
      if (action.type === 'SOCKET_ORDER_UPDATE') {
        const token = yield select((state: RootState) => state.authentication.data?.token);
        if (token) {
          yield put({ type: Type.GET_ORDERS, payload: token });
        }
      } else {
        yield put({ type: Type[action.type as keyof typeof Type] || action.type, payload: action.payload });
      }
    }

  } finally {
    console.log("🔌 Socket channel closed");
  }
}

export function* watchSocket(): Generator<any, void, any> {
  let socketTask: any = null;
  
  while (true) {
    const action: { type: string; payload: any } = yield take(Type.USER_LOGIN_COMPLETED);
    
    if (socketTask) {
      yield cancel(socketTask);
    }

    const token = action.payload.token;
    const userId = action.payload.user?.id; // Extracting userId from payload

    if (token && userId) {
      console.log('🔗 Setting up socket for user (Saga) with token');
      socketTask = yield fork(handleSocketLifecycle, String(token), userId);
    }
  }
}