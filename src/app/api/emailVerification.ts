import { postRequest } from './client';

export type ResendVerificationResponse = {
  success: boolean;
  message: string;
};

export const resendVerificationEmailApi = async (email: string) => {
  return postRequest<ResendVerificationResponse>('/resend-verification', { email });
};
