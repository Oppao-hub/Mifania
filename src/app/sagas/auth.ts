import { takeEvery, call, put } from 'redux-saga/effects';
import { userLoginApi, userRegisterApi } from '../api/auth';
import * as Type from '../../app/actions';

export function* userLoginAsync(action: any): Generator<any, any, any> {
    yield put({ type: Type.USER_LOGIN_REQUEST });
  try {
    const response = yield call(userLoginApi, action.payload);
    if (response.ok) {
      const data = yield response.json(); 
      yield put({ type: Type.USER_LOGIN_COMPLETED, payload: data });
    } else {
      const errorData = yield response.json();
      throw new Error(errorData.message || "Invalid Email or Password");
    }
  } catch (error: any) {
    yield put({ type: Type.USER_LOGIN_ERROR, payload: error.message });
  }
}

export function* userRegister(action: any): Generator<any, any, any>{
  yield put({ type: Type.USER_REGISTER_REQUEST });
  try{
    const response = yield call(userRegisterApi, action.payload);
    if(response.ok){
      const data = yield response.json();
      yield put({ type: Type.USER_REGISTER_COMPLETED, payload: data});
    } else {
      const errorData = yield response.json();
      throw new Error(errorData.message || "Registration failed");
    }
  }catch(error: any){
    yield put({ type: Type.USER_REGISTER_ERROR, payload: error.message });
  }
}

export function* watchLogin() {
  yield takeEvery(Type.USER_LOGIN, userLoginAsync);
}

export function* watchRegister(){
  yield takeEvery(Type.USER_REGISTER, userRegister)
}