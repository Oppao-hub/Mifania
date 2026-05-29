import { takeEvery, call, put, fork } from 'redux-saga/effects';
import { userLoginApi, userRegisterApi, userGoogleLoginApi, userUpdateDeviceTokenApi } from '../api/auth';
import * as Type from '../../app/actions';
import { getAuth, createUserWithEmailAndPassword, signInWithCredential, GoogleAuthProvider } from '@react-native-firebase/auth';
import { getApp } from '@react-native-firebase/app';
import { getMessaging, getToken } from '@react-native-firebase/messaging';
import { resolveResourceIri, getCustomerRefFromUser } from '../../utils/apiResource';
import { AlertMsg } from '../../components/AlertMsg';
import { disconnectSocket } from '../../services/socket';

function assertCustomerAccount(roles: string[]): void {
    const isCustomer =
        roles.includes('ROLE_USER')
        || roles.includes('ROLE_CUSTOMER');

    if (!isCustomer) {
        throw new Error('Access Denied: This account is not a customer account.');
    }

    if (roles.includes('ROLE_ADMIN') || roles.includes('ROLE_SUPER_ADMIN')) {
        console.log('⚠️ Admin account detected on mobile.');
    }
}

function* syncDeviceToken(data: { token: string; user: any }): Generator<any, void, any> {
    const customerRef = getCustomerRefFromUser(data.user);
    const customerIri = resolveResourceIri(customerRef, 'customers');

    try {
        const messagingInstance = getMessaging(getApp());
        const deviceToken = yield call(getToken, messagingInstance);
        if (deviceToken && data.token && customerIri) {
            console.log('📲 FCM Token obtained:', deviceToken);
            yield call(userUpdateDeviceTokenApi, customerIri, deviceToken, data.token);
            console.log('✅ Device token synced with backend.');
        }
    } catch (pushError) {
        console.log('⚠️ Push token sync failed:', pushError);
    }
}

function* syncCustomerAndWallet(data: { token: string; user: any }): Generator<any, void, any> {
    const customerRef = getCustomerRefFromUser(data.user);
    if (!customerRef) {
        return;
    }

    yield put({
        type: Type.GET_CUSTOMER,
        payload: { id: customerRef, token: data.token },
    });
    yield put({
        type: Type.GET_WALLET,
        payload: { id: customerRef, token: data.token },
    });
    yield put({ type: Type.GET_ADDRESSES });
    yield put({ type: Type.MERGE_GUEST_WISHLIST });
}

function* syncPostLoginSideEffects(
    data: { token: string; user: any },
    options: { showWelcomeToast?: boolean } = {},
): Generator<any, void, any> {
    const { showWelcomeToast = true } = options;

    if (showWelcomeToast) {
        AlertMsg.customSuccess({ title: 'Welcome Back!', message: 'You have successfully logged in.' });
    }

    yield call(syncCustomerAndWallet, data);
    yield call(syncDeviceToken, data);
}

function* syncGooglePostLoginSideEffects(
    idToken: string,
    data: { token: string; user: any; is_new_user?: boolean },
): Generator<any, void, any> {
    try {
        const authInstance = getAuth();
        const googleCredential = GoogleAuthProvider.credential(idToken);
        yield call(signInWithCredential, authInstance, googleCredential);
        console.log('✅ Firebase synced with Google Token.');
    } catch (firebaseError) {
        console.log('⚠️ Firebase sync failed:', firebaseError);
    }

    if (data.is_new_user) {
        AlertMsg.customSuccess({
            title: 'Welcome to Mifania!',
            message: 'Your account has been created successfully using Google.',
        });
    } else {
        AlertMsg.customSuccess({
            title: 'Welcome Back!',
            message: 'You have successfully logged in.',
        });
    }

    yield call(syncCustomerAndWallet, data);
    yield call(syncDeviceToken, data);
}

export function* userLoginAsync(action: { type: string; payload: any }): Generator<any, void, any> {
    yield put({ type: Type.USER_LOGIN_REQUEST });
    try {
        const data = yield call(userLoginApi, action.payload);
        console.log('📍 Login API Response:', JSON.stringify(data));

        assertCustomerAccount(data.user?.roles || []);

        yield put({ type: Type.USER_LOGIN_COMPLETED, payload: data });
        yield fork(syncPostLoginSideEffects, data);
    } catch (error: any) {
        console.log('❌ Login Saga Error:', error);

        const message = error.message || 'An unknown error occurred';
        yield put({ type: Type.USER_LOGIN_ERROR, payload: message });
    }
}

export function* userGoogleLoginAsync(action: { type: string; payload: { idToken: string } }): Generator<any, void, any> {
    yield put({ type: Type.USER_LOGIN_REQUEST });

    try {
        const data = yield call(userGoogleLoginApi, action.payload.idToken);

        if (!data?.token) {
            throw new Error('Login failed: server did not return an authentication token.');
        }

        assertCustomerAccount(data.user?.roles || []);

        yield put({ type: Type.USER_LOGIN_COMPLETED, payload: data });
        yield fork(syncGooglePostLoginSideEffects, action.payload.idToken, data);
    } catch (error: any) {
        const message = error.message || 'Google Login failed';
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
            console.log('Firebase registration sync failed:', firebaseError);
        }

    } catch(error: any) {
        console.log('❌ Register Saga Error:', error);
        const message = error.message || 'An unknown error occurred';

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
        console.log('✅ Socket disconnected on logout.');

    } catch (error) {
        console.log('⚠️ Logout sync failed:', error);
    } finally {
        yield put({ type: Type.USER_LOGIN_RESET });
    }
}

export function* watchLogin() {
    yield takeEvery(Type.USER_LOGIN, userLoginAsync);
}

export function* watchGoogleLogin() {
    yield takeEvery(Type.USER_GOOGLE_LOGIN, userGoogleLoginAsync);
}

export function* watchRegister(){
    yield takeEvery(Type.USER_REGISTER, userRegister)
}

export function* watchLogout() {
    yield takeEvery(Type.USER_LOGOUT, userLogout);
}
