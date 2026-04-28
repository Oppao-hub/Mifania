import { takeEvery, call, put } from 'redux-saga/effects';
import { userLoginApi, userRegisterApi } from '../api/auth';
import * as Type from '../../app/actions';
import auth from '@react-native-firebase/auth';

export function* userLoginAsync(action: { type: string; payload: any }): Generator<any, void, any> {
    yield put({ type: Type.USER_LOGIN_REQUEST });
  try {
    const response = yield call(userLoginApi, action.payload);
    if (response.ok) {
      const data = yield response.json(); 
      
      // Persist session via Firebase if not already authenticated
      // This satisfies the "No AsyncStorage" requirement as Firebase handles its own persistence
      try {
        const currentUser = auth().currentUser;
        if (!currentUser) {
          // You might need to adjust this if your API and Firebase passwords aren't the same
          // or if you want to use signInAnonymously() just for persistence
          yield call([auth(), auth().signInWithEmailAndPassword], action.payload.email, action.payload.password);
        }
      } catch (firebaseError) {
        console.log("Firebase sync failed, but API login succeeded:", firebaseError);
      }

      yield put({ type: Type.USER_LOGIN_COMPLETED, payload: data });
    } else {
      const errorData = yield response.json();
      throw new Error(errorData.message || "Invalid Email or Password");
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "An unknown error occurred";
    yield put({ type: Type.USER_LOGIN_ERROR, payload: message });
  }
}

export function* userRegister(action: { type: string; payload: any }): Generator<any, void, any>{
  yield put({ type: Type.USER_REGISTER_REQUEST });
  try{
    const response = yield call(userRegisterApi, action.payload);
    if(response.ok){
      const data = yield response.json();

      // Create Firebase account for persistence
      try {
        yield call([auth(), auth().createUserWithEmailAndPassword], action.payload.email, action.payload.password);
      } catch (firebaseError) {
        console.log("Firebase registration sync failed:", firebaseError);
      }

      yield put({ type: Type.USER_REGISTER_COMPLETED, payload: data});
    } else {
      const errorData = yield response.json();
      throw new Error(errorData.message || "Registration failed");
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