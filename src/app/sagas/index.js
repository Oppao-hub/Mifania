import { all, fork } from 'redux-saga/effects';
import { watchAuth } from './auth';
import { watchProduct } from './product';

export default function* rootSaga() {
    yield all([
        fork(watchAuth),
        fork(watchProduct),
    ]);
}