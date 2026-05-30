import { Platform, PermissionsAndroid } from 'react-native';
import { getApp } from '@react-native-firebase/app';
import {
  AuthorizationStatus,
  getMessaging,
  getToken,
  isDeviceRegisteredForRemoteMessages,
  onTokenRefresh,
  registerDeviceForRemoteMessages,
  requestPermission,
} from '@react-native-firebase/messaging';
import notifee, { AndroidImportance, AuthorizationStatus as NotifeeAuthStatus } from '@notifee/react-native';
import { clearDeviceTokenApi, registerDeviceTokenApi } from '../app/api/auth';
import { isApiRequestError } from '../app/api/client';
import { isSessionReadyForAuthenticatedApi, isUnauthorizedError } from '../utils/authSession';
import { getCustomerRefFromUser, resolveResourceIri } from '../utils/apiResource';

let tokenRefreshUnsubscribe: (() => void) | null = null;
let notificationChannelReady = false;
let cachedDisplayPermission: boolean | null = null;

const sleep = (ms: number) => new Promise<void>((resolve) => {
  setTimeout(resolve, ms);
});

export function resetCachedNotificationPermission(): void {
  cachedDisplayPermission = null;
}

async function ensureAndroidPostNotificationsPermission(): Promise<boolean> {
  if (Platform.OS !== 'android' || Number(Platform.Version) < 33) {
    return true;
  }

  const alreadyGranted = await PermissionsAndroid.check(
    PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
  );
  if (alreadyGranted) {
    return true;
  }

  const result = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
  );

  if (result !== PermissionsAndroid.RESULTS.GRANTED) {
    console.warn('[push] POST_NOTIFICATIONS permission denied on Android.');
    return false;
  }

  return true;
}

export async function ensureNotificationPermission(force = false): Promise<boolean> {
  if (!force && cachedDisplayPermission === true) {
    return true;
  }

  const androidGranted = await ensureAndroidPostNotificationsPermission();
  if (!androidGranted) {
    cachedDisplayPermission = false;
    return false;
  }

  const notifeeSettings = await notifee.requestPermission();
  const notifeeGranted = notifeeSettings.authorizationStatus >= NotifeeAuthStatus.AUTHORIZED;

  if (Platform.OS === 'ios') {
    const messagingInstance = getMessaging(getApp());
    const registered = isDeviceRegisteredForRemoteMessages(messagingInstance);
    if (!registered) {
      await registerDeviceForRemoteMessages(messagingInstance);
    }

    const authStatus = await requestPermission(messagingInstance);
    const fcmGranted =
      authStatus === AuthorizationStatus.AUTHORIZED
      || authStatus === AuthorizationStatus.PROVISIONAL;

    if (!fcmGranted) {
      console.warn('[push] iOS remote notification permission denied.');
    }

    cachedDisplayPermission = notifeeGranted && fcmGranted;
    return cachedDisplayPermission;
  }

  if (!notifeeGranted) {
    console.warn('[push] Notification permission denied.');
  }

  cachedDisplayPermission = notifeeGranted;
  return notifeeGranted;
}

export async function ensureNotificationChannel(): Promise<void> {
  if (notificationChannelReady) {
    return;
  }

  await notifee.createChannel({
    id: 'default',
    name: 'Default Channel',
    importance: AndroidImportance.HIGH,
  });
  notificationChannelReady = true;
}

/** Request permissions and create the Android notification channel once at startup. */
export async function initializePushNotifications(forcePermission = false): Promise<boolean> {
  await ensureNotificationChannel();
  return ensureNotificationPermission(forcePermission);
}

export async function obtainFcmToken(): Promise<string | null> {
  const messagingInstance = getMessaging(getApp());

  if (Platform.OS === 'ios') {
    const registered = isDeviceRegisteredForRemoteMessages(messagingInstance);
    if (!registered) {
      await registerDeviceForRemoteMessages(messagingInstance);
    }
  }

  try {
    const token = await getToken(messagingInstance);
    if (__DEV__ && token) {
      console.log('[push] FCM token obtained:', `${token.slice(0, 12)}...`);
    }
    return token;
  } catch (error) {
    console.error('[push] Failed to obtain FCM token:', error);
    return null;
  }
}

type PushRegistrationContext = {
  userId?: number;
  customerIri?: string | null;
};

export async function syncDevicePushToken(
  authToken: string,
  context: PushRegistrationContext = {},
): Promise<boolean> {
  if (!isSessionReadyForAuthenticatedApi()) {
    console.log('[push] Skipping token sync until session is validated.');
    return false;
  }

  const maxAttempts = 3;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      await ensureNotificationChannel();

      if (Platform.OS === 'ios') {
        const permitted = await ensureNotificationPermission();
        if (!permitted) {
          console.warn('[push] Cannot sync device token without notification permission on iOS.');
          return false;
        }
      } else {
        await ensureNotificationPermission();
      }

      const deviceToken = await obtainFcmToken();
      if (!deviceToken) {
        if (attempt < maxAttempts) {
          await sleep(1000 * attempt);
          continue;
        }
        console.warn('[push] No FCM token available after retries.');
        return false;
      }

      await registerDeviceTokenApi(deviceToken, authToken, context);
      console.log('[push] Device token synced with backend.');
      return true;
    } catch (error) {
      if (isApiRequestError(error) && error.status === 401) {
        console.warn('[push] Token sync unauthorized.');
        return false;
      }
      if (isUnauthorizedError(error instanceof Error ? error.message : String(error))) {
        return false;
      }
      console.error(`[push] Failed to sync device token (attempt ${attempt}/${maxAttempts}):`, error);
      if (attempt < maxAttempts) {
        await sleep(1000 * attempt);
      }
    }
  }

  return false;
}

export function buildPushRegistrationContext(user?: {
  id?: number;
  customer?: string | { '@id'?: string; id?: number };
  customerId?: number;
} | null): PushRegistrationContext {
  const customerRef = getCustomerRefFromUser(user);
  return {
    userId: user?.id,
    customerIri: resolveResourceIri(customerRef, 'customers'),
  };
}

export function startPushTokenRefreshListener(
  getAuthToken: () => string | undefined,
  getRegistrationContext: () => PushRegistrationContext,
): void {
  if (tokenRefreshUnsubscribe) {
    return;
  }

  const messagingInstance = getMessaging(getApp());
  tokenRefreshUnsubscribe = onTokenRefresh(messagingInstance, async (newToken) => {
    const authToken = getAuthToken();
    if (!authToken || !newToken) {
      return;
    }

    try {
      await registerDeviceTokenApi(newToken, authToken, getRegistrationContext());
      console.log('[push] Refreshed FCM token synced with backend.');
    } catch (error) {
      console.error('[push] Failed to sync refreshed FCM token:', error);
    }
  });
}

export async function clearDevicePushToken(authToken: string): Promise<void> {
  try {
    await clearDeviceTokenApi(authToken);
  } catch (error) {
    console.log('[push] Failed to clear device push token:', error);
  }
}
