import { ASSET_URL, getRequest } from './client';

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

const DEFAULT_LOYALTY_POLICY: LoyaltyPolicy = {
    pointsPerCurrency: 10,
    minOrderForRedemption: 100,
    maxRedemptionPercentage: 0.3,
};

const LOYALTY_POLICY_ENDPOINTS = [
    '/api/loyalty-policy',
    '/api/loyalty_policy',
    '/api/loyalty-policies',
    '/api/loyalty_policies',
    '/api/loyaltyPolicies',
];

let loyaltyPolicyCache: LoyaltyPolicy | null = null;
let loyaltyPolicyRequest: Promise<LoyaltyPolicy> | null = null;

const toNumber = (value: unknown, fallback: number): number => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
};

const normalizePolicy = (payload: any): LoyaltyPolicy => {
    const source = Array.isArray(payload?.member)
        ? payload.member[0]
        : Array.isArray(payload?.['hydra:member'])
            ? payload['hydra:member'][0]
            : payload;

    return {
        pointsPerCurrency: Math.max(
            1,
            toNumber(source?.pointsPerCurrency ?? source?.points_per_currency, DEFAULT_LOYALTY_POLICY.pointsPerCurrency),
        ),
        minOrderForRedemption: Math.max(
            0,
            toNumber(
                source?.minOrderForRedemption ?? source?.min_order_for_redemption,
                DEFAULT_LOYALTY_POLICY.minOrderForRedemption,
            ),
        ),
        maxRedemptionPercentage: Math.min(
            1,
            Math.max(
                0,
                toNumber(
                    source?.maxRedemptionPercentage ?? source?.max_redemption_percentage,
                    DEFAULT_LOYALTY_POLICY.maxRedemptionPercentage,
                ),
            ),
        ),
    };
};

const fetchLoyaltyPolicyQuietly = async (token: string): Promise<LoyaltyPolicy> => {
    for (const endpoint of LOYALTY_POLICY_ENDPOINTS) {
        try {
            const response = await fetch(`${ASSET_URL}${endpoint}`, {
                method: 'GET',
                headers: {
                    Accept: 'application/ld+json',
                    'Content-Type': 'application/ld+json',
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                continue;
            }

            const payload = await response.json();
            return normalizePolicy(payload);
        } catch {
            // Try next endpoint candidate silently.
        }
    }

    return DEFAULT_LOYALTY_POLICY;
};

export const getLoyaltyPolicyApi = async (token: string): Promise<LoyaltyPolicy> => {
    if (loyaltyPolicyCache) {
        return loyaltyPolicyCache;
    }

    if (!loyaltyPolicyRequest) {
        loyaltyPolicyRequest = fetchLoyaltyPolicyQuietly(token)
            .then((policy) => {
                loyaltyPolicyCache = policy;
                return policy;
            })
            .finally(() => {
                loyaltyPolicyRequest = null;
            });
    }

    return loyaltyPolicyRequest;
};
