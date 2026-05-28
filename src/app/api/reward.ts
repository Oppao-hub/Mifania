import { getRequest } from './client';

export const getRewardsApi = async (token: string) => {
    // API Platform collections are usually wrapped in hydra:member or member
    const response = await getRequest<any>("/rewards", token);
    return response['member'] || response['hydra:member'] || [];
};

export interface LoyaltyPolicy {
    pointsPerCurrency: number;
    minOrderForRedemption: number;
    maxRedemptionPercentage: number;
}

export const getLoyaltyPolicyApi = async (token: string): Promise<LoyaltyPolicy> => {
    const response = await getRequest<Partial<LoyaltyPolicy>>('/loyalty-policy', token);
    return {
        pointsPerCurrency: Math.max(1, Number(response.pointsPerCurrency ?? 10)),
        minOrderForRedemption: Number(response.minOrderForRedemption ?? 100),
        maxRedemptionPercentage: Number(response.maxRedemptionPercentage ?? 0.3),
    };
};
