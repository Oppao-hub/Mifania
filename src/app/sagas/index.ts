import { all } from 'redux-saga/effects';
import { watchLogin, watchRegister, watchLogout, watchGoogleLogin } from './auth';
import { watchProduct } from './product';
import { watchCategory } from './category';
import { watchSubCategory } from './subCategory';
import { watchCart } from './cart';
import { watchSocket } from './socket';
import { watchCustomer } from './customer';
import { watchAddress } from './address';
import { watchWallet } from './wallet';
import { watchOrder } from './order';
import { watchNotification } from './notification';
import { watchWishlist } from './wishlist';
import { watchSessionRestore } from './sessionRestore';
import { watchRealtimeRefresh } from './realtimeRefresh';

export default function* rootSaga() {
    yield all([
        watchLogin(),
        watchGoogleLogin(),
        watchRegister(),
        watchLogout(),
        watchProduct(),
        watchCategory(),
        watchSubCategory(),
        watchCart(),
        watchSocket(),
        watchCustomer(),
        watchAddress(),
        watchWallet(),
        watchOrder(),
        watchNotification(),
        watchWishlist(),
        watchSessionRestore(),
        watchRealtimeRefresh(),
    ]);
}
