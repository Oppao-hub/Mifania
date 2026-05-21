import { legacy_createStore as createStore, applyMiddleware, combineReducers } from "redux";
import createSagaMiddleware from "redux-saga";
import { persistStore, persistReducer } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import secureStorage from '../../utils/secureStorage';

import { authReducer } from '../reducers/auth';
import { productReducer } from '../reducers/product';
import rootSaga from "../sagas";
import { categoryReducer } from "../reducers/category";
import { subCategoryReducer } from "../reducers/subCategory";
import { cartReducer } from "../reducers/cart";
import { wishlistReducer } from "../reducers/wishlist";
import { customerReducer } from "../reducers/customer";
import { loyaltyReducer } from "../reducers/loyalty";
import { orderReducer } from "../reducers/order";
import { notificationReducer } from "../reducers/notification";
import * as Types from '../actions';

const sagaMiddleware = createSagaMiddleware();

const authPersistConfig = {
    key: 'auth',
    storage: secureStorage,
};

const rootPersistConfig = {
    key: 'root',
    storage: AsyncStorage,
    whitelist: ['cart', 'wishlist'] // Persist cart and wishlist, auth is handled separately
};

const appReducer = combineReducers({
    authentication: persistReducer(authPersistConfig, authReducer),
    product: productReducer,
    category: categoryReducer,
    subCategory: subCategoryReducer,
    cart: cartReducer,
    wishlist: wishlistReducer,
    customer: customerReducer,
    loyalty: loyaltyReducer,
    order: orderReducer,
    notification: notificationReducer,
});

const rootReducer = (state: any, action: any) => {
    if (action.type === Types.USER_LOGOUT) {
        // clear local storage for auth since it's nested
        secureStorage.removeItem('auth');
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
