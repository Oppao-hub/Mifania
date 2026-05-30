import { isApiRequestError } from '../app/api/client';

/** Endpoints where 401 means bad credentials, not an expired JWT. */
export const isPublicAuthRequestUrl = (url: string): boolean => {
  const path = url.split('?')[0] ?? '';
  return (
    path.endsWith('/login') ||
    path.endsWith('/login/google') ||
    path.endsWith('/register') ||
    path.endsWith('/reset-password/request') ||
    path.endsWith('/reset-password/reset') ||
    path.endsWith('/resend-verification')
  );
};

const extractApiErrorMessage = (error: unknown): string => {
  if (isApiRequestError(error)) {
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'Something went wrong. Please try again.';
};

/** User-facing copy for sign-in / sign-up failures. */
export const mapAuthErrorMessage = (error: unknown): string => {
  const raw = extractApiErrorMessage(error).trim();
  const lower = raw.toLowerCase();

  if (!raw) {
    return 'Something went wrong. Please try again.';
  }

  if (lower.includes('deactivated')) {
    return 'Your account has been deactivated. Please contact an admin to reactivate your account.';
  }

  if (
    lower === 'unauthorized' ||
    lower.includes('invalid credentials') ||
    lower.includes('bad credentials')
  ) {
    return 'Invalid email or password.';
  }

  if (lower.includes('not verified') || lower.includes('verify your email')) {
    return 'Please verify your email address before signing in.';
  }

  if (lower.includes('session expired') || lower.includes('jwt expired')) {
    return 'Your session has expired. Please sign in again.';
  }

  if (lower.includes('too many requests')) {
    return 'Too many attempts. Please wait a few minutes and try again.';
  }

  if (lower.includes('network error') || lower.includes('request timed out')) {
    return raw;
  }

  return raw;
};

export type LoginErrorStyle = 'inline' | 'modal';

export interface LoginErrorPresentation {
  title: string;
  message: string;
  style: LoginErrorStyle;
}

/**
 * Wrong credentials → inline (no modal). Account status, network, etc. → modal.
 */
export const getLoginErrorPresentation = (error: unknown): LoginErrorPresentation => {
  const message = mapAuthErrorMessage(error);
  const lower = message.toLowerCase();

  const isInline =
    lower.includes('invalid email or password') ||
    lower.includes('deactivated') ||
    lower.includes('verify your email') ||
    lower.includes('please enter your email and password') ||
    lower.includes('valid email address');

  return {
    title: 'Login Failed',
    message,
    style: isInline ? 'inline' : 'modal',
  };
};
