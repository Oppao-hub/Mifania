import { takeEvery, call, put } from 'redux-saga/effects';
import { userLoginApi, userRegisterApi } from '../api/auth';
import * as Type from '../../app/actions';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from '@react-native-firebase/auth';

export function* userLoginAsync(action: { type: string; payload: any }): Generator<any, void, any> {
  yield put({ type: Type.USER_LOGIN_REQUEST });
  try {
    const data = yield call(userLoginApi, action.payload);
    
    try {
      const authInstance = getAuth();
      const currentUser = authInstance.currentUser;
      if (!currentUser) {
        yield call(signInWithEmailAndPassword, authInstance, action.payload.email, action.payload.password);
      }
    } catch (firebaseError) {
      console.log("Firebase sync failed:", firebaseError);
    }

    yield put({ type: Type.USER_LOGIN_COMPLETED, payload: data });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "An unknown error occurred";
    yield put({ type: Type.USER_LOGIN_ERROR, payload: message });
  }
}

export function* userRegister(action: { type: string; payload: any }): Generator<any, void, any>{
  yield put({ type: Type.USER_REGISTER_REQUEST });
  try{
    const data = yield call(userRegisterApi, action.payload);
    
    yield put({ type: Type.USER_REGISTER_COMPLETED, payload: data});

    try {
      const authInstance = getAuth();
      yield call(createUserWithEmailAndPassword, authInstance, action.payload.email, action.payload.password);
    } catch (firebaseError) {
      console.log("Firebase registration sync failed:", firebaseError);
    }

  }catch(error: unknown){
    const message = error instanceof Error ? error.message : "An unknown error occurred";
    yield put({ type: Type.USER_REGISTER_ERROR, payload: message });
  }
}

export function* watchLogin() {
  yield takeEvery(Type.USER_LOGIN, userLoginAsync);
}

export function* watchRegister(){
  yield takeEvery(Type.USER_REGISTER, userRegister)
}