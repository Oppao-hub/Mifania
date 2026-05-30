import { getCrashlytics, log, recordError } from '@react-native-firebase/crashlytics';

import { getErrorMessage } from './errorPresentation';

export const reportAppError = (error: Error, componentStack?: string | null): void => {
  if (__DEV__) {
    console.error('[AppErrorBoundary]', error, componentStack);
    return;
  }

  try {
    const crashlytics = getCrashlytics();
    if (componentStack) {
      log(crashlytics, componentStack);
    }
    recordError(crashlytics, error);
  } catch {
    // Crashlytics may be unavailable in some environments.
  }
};

export const getAppCrashDescription = (error: unknown): string => {
  if (__DEV__) {
    const message = getErrorMessage(error);
    return message || 'An unexpected error occurred.';
  }

  return 'The app ran into an unexpected problem. Please try again.';
};
