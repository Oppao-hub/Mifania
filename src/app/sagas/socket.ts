import { take, call, cancel, put, fork, select } from 'redux-saga/effects';
import { eventChannel } from 'redux-saga';
import * as Type from '../actions';
import { setupSocket } from '../../services/socket';
import { RootState } from '../../utils/types';

function* handleSocketLifecycle(userId: string): Generator<any, void, any> {
  try {
    const channel = yield call(function(): any {
      return eventChannel(emit => {
        // Pass the action directly from socket service
        const s = setupSocket(userId, (action) => {
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
        // Find token and trigger order fetch
        const token = yield select((state: RootState) => state.authentication.data?.token);
        if (token) {
          yield put({ type: Type.GET_ORDERS, payload: token });
        }
      } else {
        // Handle ADD_NOTIFICATION and others
        // Map string string action type to actual constant if needed,
        // but since Type.ADD_NOTIFICATION is usually the same string, we can just put it.
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
    
    // Cancel existing socket if any
    if (socketTask) {
      yield cancel(socketTask);
    }

    const userEmail = action.payload.user?.email;

    if (userEmail) {
      console.log('🔗 Setting up socket for user (Saga):', userEmail);
      socketTask = yield fork(handleSocketLifecycle, String(userEmail));
    }
  }
}
