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
        case Types.CREATE_REDEMPTION_REQUEST:
            return { ...state, isLoading: true, isError: false };
        case Types.GET_WALLET_COMPLETED:
            return { ...state, isLoading: false, wallet: action.payload, isError: false };
        case Types.GET_REWARDS_COMPLETED:
            return { ...state, isLoading: false, rewards: action.payload, isError: false };
        case Types.GET_REDEMPTIONS_COMPLETED:
            return { ...state, isLoading: false, redemptions: action.payload, isError: false };
        case Types.CREATE_REDEMPTION_COMPLETED:
            return { ...state, isLoading: false, isError: false };
        case Types.GET_WALLET_ERROR:
        case Types.GET_REWARDS_ERROR:
        case Types.GET_REDEMPTIONS_ERROR:
        case Types.CREATE_REDEMPTION_ERROR:
            return { ...state, isLoading: false, isError: true, error: action.payload };
        default:
            return state;
    }
}
