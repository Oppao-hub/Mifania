import { useEffect, useRef, useState, useCallback } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getSocketConnected, subscribeSocketConnection } from '../services/socket';
import { LIVE_SYNC_CONNECTED_POLL_MS } from '../config/realtime';

function useSocketConnected(): boolean {
  const [connected, setConnected] = useState(getSocketConnected);

  useEffect(() => subscribeSocketConnection(setConnected), []);

  return connected;
}

/**
 * Runs a callback once when the screen is focused, then on an interval:
 * - every LIVE_SYNC_CONNECTED_POLL_MS while the socket is connected (safety net)
 * - every intervalMs while the socket is disconnected (fallback)
 * Also refreshes once when the socket reconnects while the screen is focused.
 */
export function useLiveSyncPoll(
  callback: () => void,
  intervalMs: number,
  enabled = true,
) {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;
  const socketConnected = useSocketConnected();
  const wasConnectedRef = useRef(socketConnected);
  const pollIntervalMs = socketConnected ? LIVE_SYNC_CONNECTED_POLL_MS : intervalMs;

  useFocusEffect(
    useCallback(() => {
      if (!enabled) {
        return undefined;
      }

      callbackRef.current();

      const timer = setInterval(() => callbackRef.current(), pollIntervalMs);
      return () => clearInterval(timer);
    }, [enabled, pollIntervalMs]),
  );

  useEffect(() => {
    if (!enabled) {
      wasConnectedRef.current = socketConnected;
      return;
    }

    if (!wasConnectedRef.current && socketConnected) {
      callbackRef.current();
    }

    wasConnectedRef.current = socketConnected;
  }, [enabled, socketConnected]);
}

/** Reconnect socket and refresh data when the app returns to foreground. */
export function useAppForegroundSync(
  onActive: () => void,
  enabled = true,
) {
  const onActiveRef = useRef(onActive);
  onActiveRef.current = onActive;

  useEffect(() => {
    if (!enabled) {
      return undefined;
    }

    const handleChange = (state: AppStateStatus) => {
      if (state === 'active') {
        onActiveRef.current();
      }
    };

    const subscription = AppState.addEventListener('change', handleChange);

    return () => subscription.remove();
  }, [enabled]);
}

/** Focus refresh + interval polling for screens that must stay live. */
export function useScreenLiveSync(callback: () => void, intervalMs: number, enabled = true) {
  useLiveSyncPoll(callback, intervalMs, enabled);
}
