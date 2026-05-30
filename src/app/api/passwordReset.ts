import { postRequest } from './client';

export interface PasswordResetActionResponse {
  success: boolean;
  message: string;
}

export interface RequestPasswordResetPayload {
  email: string;
}

export interface ResetPasswordPayload {
  token: string;
  password: string;
  confirmPassword: string;
}

export const requestPasswordResetApi = async (
  payload: RequestPasswordResetPayload,
): Promise<PasswordResetActionResponse> => {
  return postRequest<PasswordResetActionResponse>('/reset-password/request', {
    email: payload.email.trim().toLowerCase(),
  });
};

export const resetPasswordApi = async (
  payload: ResetPasswordPayload,
): Promise<PasswordResetActionResponse> => {
  return postRequest<PasswordResetActionResponse>('/reset-password/reset', payload);
};
