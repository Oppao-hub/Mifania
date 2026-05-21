import { take, call, cancel, put, fork } from 'redux-saga/effects';
import { eventChannel } from 'redux-saga';
import * as Type from '../actions';
import { setupSocket } from '../../services/socket';

function* handleSocketLifecycle(userId: string): Generator<any, void, any> {
  try {
    const channel = yield call(function(): any {
      return eventChannel(emit => {
        const s = setupSocket(userId, (data) => {
          emit({ type: Type.ADD_NOTIFICATION, payload: data });
        });
        return () => {
          s.disconnect();
        };
      });
    });

    while (true) {
      const action: { type: string; payload: any } = yield take(channel);
      yield put(action);
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
