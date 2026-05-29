import { deleteRequest, getRequest, postRequest } from './client';
import { SavedPaymentMethod } from '../../utils/types';

const parseCollection = (data: any): SavedPaymentMethod[] => {
  if (Array.isArray(data)) return data;
  return data['hydra:member'] || data.member || data.paymentMethods || [];
};

export const getSavedPaymentMethods = async (token: string): Promise<SavedPaymentMethod[]> => {
  const data = await getRequest<any>('/me/saved-payment-methods', token);
  return parseCollection(data);
};

export const createSavedPaymentMethod = async (
  token: string,
  body: Record<string, unknown>,
): Promise<SavedPaymentMethod> => {
  return await postRequest<SavedPaymentMethod>('/customer_payment_methods', body, token);
};

export const deleteSavedPaymentMethod = async (id: number | string, token: string): Promise<void> => {
  await deleteRequest(`/customer_payment_methods/${id}`, token);
};
