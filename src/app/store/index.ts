import { legacy_createStore as createStore, applyMiddleware, combineReducers } from "redux";
import createSagaMiddleware from "redux-saga";
import { authReducer } from '../reducers/auth';
import { productReducer } from '../reducers/product';
import rootSaga from "../sagas";

const sagaMiddleware = createSagaMiddleware();

const rootReducer = combineReducers({
    authentication: authReducer,
    product: productReducer,
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