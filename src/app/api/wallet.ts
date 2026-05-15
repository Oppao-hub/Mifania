import { Wallet } from '../../utils/types';
import { getRequest } from './client';

export const getWalletApi = async (id: number, token: string) => {
    return await getRequest<Wallet>(`/wallets/${id}`, token);
};
