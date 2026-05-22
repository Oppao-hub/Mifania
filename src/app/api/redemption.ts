import { Redemption } from '../../utils/types';
import { getRequest, postRequest } from './client';

export const getRedemptionsApi = async (token: string) => {
    const response = await getRequest<any>("/redemptions", token);
    return response['member'] || response['hydra:member'] || [];
};

export const createRedemptionApi = async (rewardIri: string, token: string) => {
    return await postRequest<Redemption>("/redemptions", { reward: rewardIri }, token);
};
