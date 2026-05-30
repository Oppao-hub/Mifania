import { combineReducers } from 'redux';
import { persistReducer } from 'redux-persist';
import secureStorage from '../../utils/secureStorage';

import { authReducer } from './auth';
import { productReducer } from './product';
import { categoryReducer } from './category';
import { subCategoryReducer } from './subCategory';
import { cartReducer } from './cart';
import { wishlistReducer } from './wishlist';
import { customerReducer } from './customer';
import { addressReducer } from './address';
import { walletReducer } from './wallet';
import { orderReducer } from './order';
import { notificationReducer } from './notification';

const authPersistConfig = {
    key: 'auth',
    storage: secureStorage,
    // Never persist transient login UI state (causes infinite "Signing in..." after reload)
    blacklist: ['isLoading', 'isError', 'error', 'sessionValidated'],
};

export const appReducer = combineReducers({
    authentication: persistReducer(authPersistConfig, authReducer),
    product: productReducer,
    category: categoryReducer,
    subCategory: subCategoryReducer,
    cart: cartReducer,
    wishlist: wishlistReducer,
    customer: customerReducer,
    address: addressReducer,
    wallet: walletReducer,
    order: orderReducer,
    notification: notificationReducer,
});
