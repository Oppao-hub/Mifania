import { all } from 'redux-saga/effects';
import { watchLogin } from './auth';
import { watchRegister } from './auth';
import { watchProduct } from './product';

export default function* rootSaga() {
    yield all([
        watchLogin(),
        watchRegister(),
        watchProduct(),
        watchPexelsImage(),
    ]);
}