import { legacy_createStore as createStore, applyMiddleware } from "redux";
import createSagaMiddleware from "redux-saga";
import { persistStore, persistReducer } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import secureStorage from '../../utils/secureStorage';
import rootSaga from "../sagas";

import { appReducer } from '../reducers/rootReducer';
import * as Types from '../actions';

const sagaMiddleware = createSagaMiddleware();

const rootPersistConfig = {
    key: 'root',
    storage: AsyncStorage,
    whitelist: ['cart', 'wishlist', 'notification'] // Persist cart, wishlist, and notifications locally
};

const rootReducer = (state: any, action: any) => {
    if (action.type === Types.USER_LOGOUT) {
        // We purge the auth storage specifically first
        secureStorage.removeItem('persist:auth');
        // Setting state to undefined will reset all reducers to initial state
        state = undefined;
    }
    return appReducer(state, action);
};

const persistedReducer = persistReducer(rootPersistConfig, rootReducer);

const store = createStore(
    persistedReducer,
    applyMiddleware(sagaMiddleware)
);

export const persistor = persistStore(store);

sagaMiddleware.run(rootSaga);

export default store;
