import { getRequest } from './client';

export const getRewardsApi = async (token: string) => {
    // API Platform collections are usually wrapped in hydra:member or member
    const response = await getRequest<any>("/rewards", token);
    return response['member'] || response['hydra:member'] || [];
};
