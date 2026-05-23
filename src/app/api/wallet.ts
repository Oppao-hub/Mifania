import { Wallet } from '../../utils/types';
import { resolveResourceId } from '../../utils/apiResource';
import { getRequest } from './client';

export const getWalletApi = async (customerRef: string | number, token: string) => {
    const id = resolveResourceId(customerRef);
    if (id == null) {
        throw new Error('Invalid customer reference for wallet');
    }
    return await getRequest<Wallet>(`/wallets/${id}`, token);
};
