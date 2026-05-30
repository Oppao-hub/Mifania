import { Wallet } from '../../utils/types';
import { resolveResourceId } from '../../utils/apiResource';
import { getCustomerApi } from './customer';
import { getRequest, postRequest } from './client';

export interface WalletMutationResponse {
    message: string;
    balance: string;
    rewardPoints: number;
}

export const getWalletApi = async (customerRef: string | number, token: string) => {
    const customer = await getCustomerApi(customerRef, token);
    const walletRef = customer.wallet;
    const walletId = resolveResourceId(walletRef);
    if (walletId == null) {
        throw new Error('Wallet not found for this customer');
    }
    return await getRequest<Wallet>(`/wallets/${walletId}`, token);
};

export const topUpWalletApi = async (
    token: string,
    payload: { amount: number; description?: string },
) => {
    return await postRequest<WalletMutationResponse>('/wallet/top-up', payload, token);
};

export interface PayPalTopUpPrepareResponse {
    prepareToken: string;
    amount: string;
}

export const preparePayPalTopUpApi = async (
    token: string,
    payload: { amount: number },
): Promise<PayPalTopUpPrepareResponse> => {
    return await postRequest<PayPalTopUpPrepareResponse>('/wallet/paypal/prepare', payload, token);
};

export const transferWalletApi = async (
    token: string,
    payload: { recipientEmail: string; amount: number; note?: string },
) => {
    return await postRequest<WalletMutationResponse>('/wallet/transfer', payload, token);
};
