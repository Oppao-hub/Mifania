import { legacy_createStore as createStore, applyMiddleware, combineReducers } from "redux";
import createSagaMiddleware from "redux-saga";
import { authReducer } from '../reducers/auth';
import { productReducer } from '../reducers/product';
import rootSaga from "../sagas";
import { categoryReducer } from "../reducers/category";
import { subCategoryReducer } from "../reducers/subCategory";
import { cartReducer } from "../reducers/cart";
import { wishlistReducer } from "../reducers/wishlist";

const sagaMiddleware = createSagaMiddleware();

const rootReducer = combineReducers({
    authentication: authReducer,
    product: productReducer,
    category: categoryReducer,
    subCategory: subCategoryReducer,
    cart: cartReducer,
    wishlist: wishlistReducer,
});

const configureStore = () => {
    const store = createStore(
        rootReducer,
        applyMiddleware(sagaMiddleware)
    );

    sagaMiddleware.run(rootSaga);

    return { store };
};

export default configureStore;