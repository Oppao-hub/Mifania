import { createStore, applyMiddleware, combineReducers } from "redux";
import { persistReducer, persistStore } from "redux-persist";
import AsyncStorage from "@react-native-async-storage/async-storage";
import createSagaMiddleware from "redux-saga";
import { authReducer } from '../reducers/auth';
import { productReducer } from '../reducers/product';
import rootSaga from "../sagas";

const sagaMiddleware = createSagaMiddleware();

const authPersistConfig = {
    key: "authentication",
    storage: AsyncStorage,
    whitelist: ['data'],
};

const rootReducer = combineReducers({
    authentication: persistReducer(authPersistConfig, authReducer),
    product: productReducer,
});

const configureStore = () => {
    const store = createStore(
        rootReducer,
        applyMiddleware(sagaMiddleware)
    );

    const persistor = persistStore(store);

    sagaMiddleware.run(rootSaga);

    return { store, persistor };
};

export default configureStore;