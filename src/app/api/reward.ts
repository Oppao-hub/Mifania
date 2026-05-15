import { getRequest } from './client';

export const getRewardsApi = async (token: string) => {
    // API Platform collections are usually wrapped in hydra:member
    const response = await getRequest<any>("/rewards", token);
    return response['hydra:member'] || [];
};
