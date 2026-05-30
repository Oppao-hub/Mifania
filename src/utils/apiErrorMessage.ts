import { isApiRequestError } from '../app/api/client';

/** Consistent user-facing message from API or thrown errors. */
export const getApiErrorMessage = (
  error: unknown,
  fallback = 'Something went wrong. Please try again.',
): string => {
  if (isApiRequestError(error)) {
    return error.message;
  }

  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return fallback;
};
