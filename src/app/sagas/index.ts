import { all } from 'redux-saga/effects';
import { watchLogin, watchRegister, watchLogout } from './auth';
import { watchProduct } from './product';
import { watchCategory } from './category';
import { watchSubCategory } from './subCategory';
import { watchCart } from './cart';
import { watchSocket } from './socket';
import { watchCustomer } from './customer';
import { watchLoyalty } from './loyalty';
import { watchOrder } from './order';
import { watchNotification } from './notification';

export default function* rootSaga() {
    yield all([
        watchLogin(),
        watchRegister(),
        watchLogout(),
        watchProduct(),
        watchCategory(),
        watchSubCategory(),
        watchCart(),
        watchSocket(),
        watchCustomer(),
        watchLoyalty(),
        watchOrder(),
        watchNotification(),
    ]);
}
