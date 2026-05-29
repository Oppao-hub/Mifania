import { postRequest } from './client';

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface AccountActionResponse {
  success: boolean;
  message: string;
}

export const changePasswordApi = async (
  payload: ChangePasswordPayload,
  token: string,
): Promise<AccountActionResponse> => {
  return postRequest<AccountActionResponse>('/account/change-password', payload, token);
};

export const deactivateAccountApi = async (token: string): Promise<AccountActionResponse> => {
  return postRequest<AccountActionResponse>('/account/deactivate', {}, token);
};
