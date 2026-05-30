import { isApiRequestError } from '../app/api/client';

type FetchSliceState = {
  isLoading: boolean;
  error: string | null;
  hasData: boolean;
};

/** Normalize API/saga failures so ErrorState can detect HTTP status codes. */
export const formatFetchErrorMessage = (error: unknown): string => {
  if (isApiRequestError(error)) {
    return `HTTP ${error.status}: ${error.message}`;
  }
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  return 'An unknown error occurred';
};

/** True when a screen should replace its content with ErrorState. */
export const shouldShowFetchError = ({
  isLoading,
  error,
  hasData,
}: FetchSliceState): boolean => Boolean(error) && !hasData && !isLoading;

export const pickPrimaryFetchError = (...errors: Array<string | null | undefined>): string | null => {
  for (const error of errors) {
    if (error) return error;
  }
  return null;
};
