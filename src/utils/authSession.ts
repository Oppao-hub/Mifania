import type { Store } from 'redux';
import * as Types from '../app/actions';

let store: Store | null = null;
let isLoggingOut = false;

export const setAuthStore = (reduxStore: Store): void => {
    store = reduxStore;
};

/** Call when the API returns 401 (expired or invalid JWT). */
export const handleSessionExpired = (): void => {
    if (!store || isLoggingOut) {
        return;
    }

    isLoggingOut = true;
    store.dispatch({ type: Types.USER_LOGOUT });

    // Allow future logouts after the store has reset
    setTimeout(() => {
        isLoggingOut = false;
    }, 1000);
};

export const isUnauthorizedError = (message?: string): boolean => {
    if (!message) {
        return false;
    }

    const normalized = message.toLowerCase();
    return (
        normalized === 'unauthorized' ||
        normalized.includes('invalid jwt') ||
        normalized.includes('jwt expired') ||
        normalized.includes('expired jwt') ||
        normalized.includes('token expired') ||
        normalized.includes('authentication required')
    );
};
