import type { Store } from 'redux';
import { REHYDRATE } from 'redux-persist';
import * as Types from '../app/actions';
import { showBlockingInfo } from './userFeedback';

import { disconnectSocket } from '../services/socket';
import { isJwtExpired, isJwtUsable } from './jwtToken';

let store: Store | null = null;
let isLoggingOut = false;
let suppressSessionLogout = false;
let silentSessionReset = false;

export const setAuthStore = (reduxStore: Store): void => {
    store = reduxStore;
};

export const isSessionLogoutSuppressed = (): boolean => suppressSessionLogout;

export const beginSuppressedSessionLogout = (): void => {
    suppressSessionLogout = true;
};

export const endSuppressedSessionLogout = (): void => {
    suppressSessionLogout = false;
};

/** Skip automatic logout for non-critical background sync (e.g. after checkout). */
export const suppressSessionLogoutFor = async <T>(fn: () => Promise<T>): Promise<T> => {
    beginSuppressedSessionLogout();
    try {
        return await fn();
    } finally {
        endSuppressedSessionLogout();
    }
};

/** Clear persisted auth without modal, Firebase sign-out, or push-token cleanup. */
export const resetStoredSessionSilently = (): void => {
    if (!store) {
        return;
    }

    silentSessionReset = true;
    disconnectSocket();
    store.dispatch({ type: Types.USER_LOGIN_RESET });
    silentSessionReset = false;
};

/** Drop an unusable JWT before authenticated startup requests run. */
export const clearExpiredStoredSession = (): boolean => {
    if (!store) {
        return false;
    }

    const token = (store.getState() as { authentication?: { data?: { token?: string } } })
        ?.authentication?.data?.token;

    if (!token || !isJwtExpired(token)) {
        return false;
    }

    resetStoredSessionSilently();
    return true;
};

export const isSilentSessionReset = (): boolean => silentSessionReset;

export const isSessionReadyForAuthenticatedApi = (): boolean => {
    if (!store) {
        return false;
    }

    const auth = (store.getState() as {
        authentication?: {
            data?: { token?: string };
            sessionValidated?: boolean;
        };
    }).authentication;

    const token = auth?.data?.token;
    return Boolean(token && auth?.sessionValidated && isJwtUsable(token));
};

/** Call when the API returns 401 (expired or invalid JWT). */
export const handleSessionExpired = (): void => {
    if (!store || isLoggingOut || suppressSessionLogout || silentSessionReset) {
        return;
    }

    const auth = (store.getState() as {
        authentication?: {
            data?: { token?: string };
            sessionValidated?: boolean;
        };
    }).authentication;

    const token = auth?.data?.token;

    if (!token) {
        return;
    }

    // During cold-start restore, session validation handles invalid tokens silently.
    if (!auth?.sessionValidated) {
        resetStoredSessionSilently();
        return;
    }

    isLoggingOut = true;

    if (!isJwtExpired(token)) {
        showBlockingInfo({
            title: 'Session Expired',
            message: 'Please sign in again to continue.',
        });
    }

    store.dispatch({ type: Types.USER_LOGOUT });

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
        normalized.includes('session expired') ||
        normalized.includes('invalid jwt') ||
        normalized.includes('jwt expired') ||
        normalized.includes('expired jwt') ||
        normalized.includes('token expired') ||
        normalized.includes('authentication required')
    );
};
