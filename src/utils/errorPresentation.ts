import { getThemeColor } from '../theme';
import { isApiRequestError } from '../app/api/client';

export type AppErrorKind =
  | 'network'
  | 'timeout'
  | 'server'
  | 'client'
  | 'unauthorized'
  | 'unknown';

export type ErrorPresentation = {
  kind: AppErrorKind;
  iconName: string;
  iconColor: string;
  iconBackgroundColor: string;
  title: string;
  description: string;
};

export const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  if (typeof error === 'object' && error && 'message' in error) {
    const message = (error as { message?: unknown }).message;
    return typeof message === 'string' ? message : '';
  }
  return '';
};

const HTTP_STATUS_PATTERN = /\b(?:error|status|code)[:\s#-]*(\d{3})\b/i;
const GET_ERROR_PATTERN = /get error:\s*(\d{3})/i;
const HTTP_PREFIX_PATTERN = /^http\s+(\d{3})\b/i;

const extractHttpStatus = (error: unknown, message: string): number | null => {
  if (isApiRequestError(error)) {
    return error.status;
  }

  const getErrorMatch = message.match(GET_ERROR_PATTERN);
  if (getErrorMatch) {
    return Number.parseInt(getErrorMatch[1], 10);
  }

  const httpPrefixMatch = message.match(HTTP_PREFIX_PATTERN);
  if (httpPrefixMatch) {
    return Number.parseInt(httpPrefixMatch[1], 10);
  }

  const match = message.match(HTTP_STATUS_PATTERN);
  if (!match) return null;
  const status = Number.parseInt(match[1], 10);
  return Number.isFinite(status) ? status : null;
};

export const classifyAppError = (error: unknown): AppErrorKind => {
  const message = getErrorMessage(error).trim();
  const lower = message.toLowerCase();

  if (!message) return 'unknown';

  if (
    lower.includes('unauthorized') ||
    lower.includes('session expired') ||
    lower.includes('not authenticated')
  ) {
    return 'unauthorized';
  }

  if (
    lower.includes('network error') ||
    lower.includes('network request failed') ||
    lower.includes('failed to fetch') ||
    lower.includes('could not reach') ||
    lower.includes('internet connection') ||
    lower.includes('offline')
  ) {
    return 'network';
  }

  if (lower.includes('timed out') || lower.includes('timeout')) {
    return 'timeout';
  }

  const status = extractHttpStatus(error, message);
  if (status != null) {
    if (status === 401 || status === 403) return 'unauthorized';
    if (status >= 500) return 'server';
    if (status >= 400) return 'client';
  }

  if (
    lower.includes('server error') ||
    lower.includes('internal server') ||
    lower.includes('service unavailable') ||
    lower.includes('bad gateway')
  ) {
    return 'server';
  }

  return 'unknown';
};

const defaultTitles: Record<AppErrorKind, string> = {
  network: 'No Internet Connection',
  timeout: 'Request Timed Out',
  server: 'Server Error',
  client: 'Request Failed',
  unauthorized: 'Session Expired',
  unknown: 'Something Went Wrong',
};

const defaultDescriptions: Record<AppErrorKind, string> = {
  network:
    'We could not reach Mifania. Check your Wi‑Fi or mobile data, then try again.',
  timeout:
    'The server took too long to respond. Please wait a moment and try again.',
  server:
    'Something went wrong on our servers. Please try again in a few minutes.',
  client: 'We could not complete that request. Please review and try again.',
  unauthorized: 'Your session has ended. Please sign in again to continue.',
  unknown: 'An unexpected error occurred. Please try again.',
};

const presentationByKind: Record<
  AppErrorKind,
  Pick<ErrorPresentation, 'iconName' | 'iconColor' | 'iconBackgroundColor'>
> = {
  network: {
    iconName: 'wifi-off',
    iconColor: getThemeColor('warning'),
    iconBackgroundColor: '#FEF3C7',
  },
  timeout: {
    iconName: 'clock-alert-outline',
    iconColor: getThemeColor('warning'),
    iconBackgroundColor: '#FEF3C7',
  },
  server: {
    iconName: 'cloud-alert',
    iconColor: getThemeColor('danger'),
    iconBackgroundColor: '#FEE2E2',
  },
  client: {
    iconName: 'alert-circle-outline',
    iconColor: getThemeColor('terracotta'),
    iconBackgroundColor: '#F5E8E4',
  },
  unauthorized: {
    iconName: 'lock-alert-outline',
    iconColor: getThemeColor('gray'),
    iconBackgroundColor: '#F3F4F6',
  },
  unknown: {
    iconName: 'help-circle-outline',
    iconColor: getThemeColor('gray'),
    iconBackgroundColor: '#F3F4F6',
  },
};

export type ErrorPresentationOptions = {
  /** e.g. "orders" → "Couldn't Load Orders" */
  context?: string;
  title?: string;
  description?: string;
};

const buildContextTitle = (context: string): string => {
  const trimmed = context.trim();
  if (!trimmed) return defaultTitles.unknown;
  const label = trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
  return `Couldn't Load ${label}`;
};

export const getErrorPresentation = (
  error: unknown,
  options?: ErrorPresentationOptions,
): ErrorPresentation => {
  const kind = classifyAppError(error);
  const message = getErrorMessage(error);
  const visuals = presentationByKind[kind];

  const title =
    options?.title ??
    (options?.context ? buildContextTitle(options.context) : defaultTitles[kind]);

  let description = options?.description ?? defaultDescriptions[kind];

  if (message && kind !== 'network' && kind !== 'timeout') {
    description = message;
  } else if (message && (kind === 'network' || kind === 'timeout') && __DEV__) {
    description = `${description}\n\n${message}`;
  }

  return {
    kind,
    ...visuals,
    title,
    description,
  };
};
