import { takeEvery, call, put } from 'redux-saga/effects';
import { userLoginApi, userRegisterApi, userGoogleLoginApi, userUpdateDeviceTokenApi } from '../api/auth';
import * as Type from '../../app/actions';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithCredential, GoogleAuthProvider } from '@react-native-firebase/auth';
import messaging from '@react-native-firebase/messaging';
// 💡 FIX 1: Added getCustomerRefFromUser to the imports
import { resolveResourceIri, getCustomerRefFromUser } from '../../utils/apiResource'; 
import { AlertMsg } from '../../components/AlertMsg';
// 💡 FIX 2: Import your socket disconnect function (adjust the path if your socket.ts is somewhere else)
import { disconnectSocket } from '../../services/socket'; 

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
    AlertMsg.customSuccess({ title: "Welcome Back!", message: "You have successfully logged in." });

    // --- FETCH CUSTOMER DATA & WALLET ---
    const customerRef = getCustomerRefFromUser(data.user);
    if (customerRef) {
      yield put({ 
        type: Type.GET_CUSTOMER, 
        payload: { id: customerRef, token: data.token } 
      });
      yield put({
        type: Type.GET_WALLET,
        payload: { id: customerRef, token: data.token }
      });
    }

    // --- PUSH NOTIFICATION TOKEN SYNC ---
    const customerIri = resolveResourceIri(customerRef, 'customers');
    try {
      const deviceToken = yield call([messaging(), messaging().getToken]);
      if (deviceToken && data.token && customerIri) {
        console.log("📲 FCM Token obtained:", deviceToken);
        yield call(userUpdateDeviceTokenApi, customerIri, deviceToken, data.token);
        console.log("✅ Device token synced with backend.");
      }
    } catch (pushError) {
      console.log("⚠️ Push token sync failed:", pushError);
    }
  } catch (error: any) {
    console.log("❌ Login Saga Error:", error);


    const message = error.response?.data.message
      || error.response?.data?.error 
      || error.message 
      || "An unknown error occurred";
    yield put({ type: Type.USER_LOGIN_ERROR, payload: message });
  }
}

export function* userGoogleLoginAsync(action: { type: string; payload: any }): Generator<any, void, any> {
  yield put({ type: Type.USER_LOGIN_REQUEST });
  
  try {
    // 💡 FIX 3: Pass ONLY the idToken string, not the whole payload object!
    const data = yield call(userGoogleLoginApi, action.payload.idToken);

    try {
      const authInstance = getAuth();
      const googleCredential = GoogleAuthProvider.credential(action.payload.idToken); 
      yield call(signInWithCredential, authInstance, googleCredential);
      console.log("✅ Firebase synced with Google Token.");
    } catch (firebaseError) {
      console.log("⚠️ Firebase sync failed:", firebaseError);
    }

    if (data.is_new_user) {
      AlertMsg.customSuccess({ 
        title: "Welcome to Mifania!", 
        message: "Your account has been created successfully using Google." 
      });
    } else {
      AlertMsg.customSuccess({ 
        title: "Welcome Back!", 
        message: "You have successfully logged in." 
      });
    }

    yield put({ type: Type.USER_LOGIN_COMPLETED, payload: data });
    
    // 💡 FIX 4: Replaced data.user.customer with getCustomerRefFromUser for safety
    const customerRef = getCustomerRefFromUser(data.user);
    if (customerRef) {
      yield put({ 
        type: Type.GET_CUSTOMER, 
        payload: { id: customerRef, token: data.token } 
      });
      yield put({
        type: Type.GET_WALLET,
        payload: { id: customerRef, token: data.token }
      });
    }

  } catch (error: any) {
    const message = error.response?.data?.error || error.message || "Google Login failed";
    yield put({ type: Type.USER_LOGIN_ERROR, payload: message });
    
    AlertMsg.customError({
      title: "Login Failed",
      message: message
    });
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

  } catch(error: any) { // 💡 FIX 3: Also updated the Register error handler
    console.log("❌ Register Saga Error:", error);
    const message = error.response?.data?.message 
      || error.response?.data?.error 
      || error.message 
      || "An unknown error occurred";
      
    yield put({ type: Type.USER_REGISTER_ERROR, payload: message });
  }
}

export function* userLogout(): Generator<any, void, any> {
  try {
    const authInstance = getAuth();
    if (authInstance.currentUser) {
      yield call([authInstance, authInstance.signOut]);
    }
    
    disconnectSocket();
    console.log("✅ Socket disconnected on logout.");

  } catch (error) {
    console.log("⚠️ Logout sync failed:", error);
  } finally {
    yield put({ type: Type.USER_LOGIN_RESET });
  }
}

export function* watchLogin() {
  yield takeEvery(Type.USER_LOGIN, userLoginAsync);
}

export function* watchGoogleLogin() {
  yield takeEvery('USER_GOOGLE_LOGIN', userGoogleLoginAsync); 
}

export function* watchRegister(){
  yield takeEvery(Type.USER_REGISTER, userRegister)
}

export function* watchLogout() {
  yield takeEvery(Type.USER_LOGOUT, userLogout);
}