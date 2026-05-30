import type { Store } from 'redux';
import * as Types from '../app/actions';
import type { RealtimeRefreshPayload } from './realtimeRefresh';

let store: Store | null = null;

export const setRealtimeStore = (reduxStore: Store): void => {
  store = reduxStore;
};

export const dispatchRealtimeRefresh = (payload: RealtimeRefreshPayload = {}): void => {
  store?.dispatch({ type: Types.SOCKET_REALTIME_REFRESH, payload });
};

export const dispatchSocketAction = (type: string, payload?: unknown): void => {
  store?.dispatch({ type, payload });
};
