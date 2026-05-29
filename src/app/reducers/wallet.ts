import * as Types from "../actions";
import { WalletSliceState } from "../../utils/types";

const initialState: WalletSliceState = {
    wallet: null,
    rewards: [],
    redemptions: [],
    isLoading: false,
    isError: false,
    error: null,
    isRedeeming: false,
    redemptionError: null,
};

export const walletReducer = (state = initialState, action: { type: string; payload?: any }): WalletSliceState => {
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
                isRedeeming: true,
                redemptionError: null,
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
            return { ...state, isRedeeming: false, redemptionError: null };
            
        case Types.CREATE_REDEMPTION_ERROR:
            const pointsToRefund = action.payload?.pointsCost || 0;
            return { 
                ...state, 
                isRedeeming: false, 
                redemptionError: action.payload?.message || action.payload,
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
};
