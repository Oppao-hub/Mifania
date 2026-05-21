import * as Types from "../actions";
import { Wallet, Reward, Redemption } from "../../utils/types";

interface LoyaltyState {
    wallet: Wallet | null;
    rewards: Reward[];
    redemptions: Redemption[];
    isLoading: boolean;
    isError: boolean;
    error: string | null;
}

const initialState: LoyaltyState = {
    wallet: null,
    rewards: [],
    redemptions: [],
    isLoading: false,
    isError: false,
    error: null,
};

export function loyaltyReducer(state = initialState, action: { type: string; payload?: any }): LoyaltyState {
    switch (action.type) {
        case Types.GET_WALLET_REQUEST:
        case Types.GET_REWARDS_REQUEST:
        case Types.GET_REDEMPTIONS_REQUEST:
            return { ...state, isLoading: true, isError: false };
            
        case Types.CREATE_REDEMPTION_REQUEST:
            // Optimistic UI Update: Deduct points immediately
            const pointsToDeduct = action.payload?.pointsCost || 0;
            return { 
                ...state, 
                isLoading: true, 
                isError: false,
                wallet: state.wallet ? {
                    ...state.wallet,
                    rewardPoints: Math.max(0, state.wallet.rewardPoints - pointsToDeduct)
                } : null
            };
            
        case Types.GET_WALLET_COMPLETED:
            return { ...state, isLoading: false, wallet: action.payload, isError: false };
        case Types.GET_REWARDS_COMPLETED:
            return { ...state, isLoading: false, rewards: action.payload, isError: false };
        case Types.GET_REDEMPTIONS_COMPLETED:
            return { ...state, isLoading: false, redemptions: action.payload, isError: false };
        case Types.CREATE_REDEMPTION_COMPLETED:
            // The wallet might be refreshed via saga anyway, but we mark it complete
            return { ...state, isLoading: false, isError: false };
            
        case Types.CREATE_REDEMPTION_ERROR:
            // Rollback optimistic update on error
            const pointsToRefund = action.payload?.pointsCost || 0;
            return { 
                ...state, 
                isLoading: false, 
                isError: true, 
                error: action.payload?.message || action.payload,
                wallet: state.wallet ? {
                    ...state.wallet,
                    rewardPoints: state.wallet.rewardPoints + pointsToRefund
                } : null
            };
            
        case Types.GET_WALLET_ERROR:
        case Types.GET_REWARDS_ERROR:
        case Types.GET_REDEMPTIONS_ERROR:
            return { ...state, isLoading: false, isError: true, error: action.payload };
        default:
            return state;
    }
}
