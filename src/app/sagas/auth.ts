import { takeEvery, call, put } from 'redux-saga/effects';
import { userLoginApi, userRegisterApi } from '../api/auth';
import * as Type from '../../app/actions';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from '@react-native-firebase/auth';

export function* userLoginAsync(action: { type: string; payload: any }): Generator<any, void, any> {
  yield put({ type: Type.USER_LOGIN_REQUEST });
  try {
    const data = yield call(userLoginApi, action.payload);
    console.log("📍 Login API Response:", JSON.stringify(data));

    const roles = data.user?.roles || [];
    
    // Check if the user has the required customer role
    if(!roles.includes('ROLE_USER')){
      throw new Error("Access Denied: This account is not a customer account.");
    }
    
    // Check if it's an admin trying to login to mobile
    if(roles.includes('ROLE_ADMIN') || roles.includes('ROLE_SUPER_ADMIN')){
       console.log("⚠️ Admin account detected on mobile.");
    }

    try {
      const authInstance = getAuth();
      const currentUser = authInstance.currentUser;
      if (!currentUser) {
        yield call(signInWithEmailAndPassword, authInstance, action.payload.email, action.payload.password);
        console.log("✅ Firebase synced.");
      }
    } catch (firebaseError) {
      console.log("⚠️ Firebase sync skipped or failed:", firebaseError);
    }

    yield put({ type: Type.USER_LOGIN_COMPLETED, payload: data });
  } catch (error: unknown) {
    console.log("❌ Login Saga Error:", error);
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

export function* userLogout(): Generator<any, void, any> {
  try {
    const authInstance = getAuth();
    yield call([authInstance, authInstance.signOut]);
  } catch (error) {
    console.log("Logout sync failed:", error);
  }
}

export function* watchLogin() {
  yield takeEvery(Type.USER_LOGIN, userLoginAsync);
}

export function* watchRegister(){
  yield takeEvery(Type.USER_REGISTER, userRegister)
}

export function* watchLogout() {
  yield takeEvery(Type.USER_LOGOUT, userLogout);
}