import { applyMiddleware, combineReducers, createStore, compose } from "redux";
import { persistReducer, persistStore } from "redux-persist";
import { authReducer } from "../reducers/auth";
import rootSaga from "../sagas";

//Config
import createSagaMiddleware from "redux-saga";
import thunk from "redux-thunk";
const sagaMiddleware = createSagaMiddleware();

const authPersistConfig = {
    key: "authentication",
    storage: AsyncStorage,
    blacklist: [],
};

const rootReducer = combineReducers({
    authentication: persistReducer(authPersistConfig, authReducer),
});

export default () => {
    let store = createStore(
        rootReducer,
        compose(applyMiddleware(sagaMiddleware, thunk))
        )

    let persistor = persistStore(store);
    const runSaga = sagaMiddleware.run(rootSaga);

    return { store, persistor, runSaga };
};