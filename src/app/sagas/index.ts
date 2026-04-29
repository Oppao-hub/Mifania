import { all } from 'redux-saga/effects';
import { watchLogin } from './auth';
import { watchRegister } from './auth';
import { watchProduct } from './product';
import { watchCategory } from './category';
import { watchSubCategory } from './subCategory';

export default function* rootSaga() {
    yield all([
        watchLogin(),
        watchRegister(),
        watchProduct(),
        watchCategory(),
        watchSubCategory(),
    ]);
}