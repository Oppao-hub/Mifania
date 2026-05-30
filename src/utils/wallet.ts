import { Wallet, WalletTransaction } from './types';

export const WALLET_TOP_UP_PRESETS = [100, 500, 1000] as const;

export type WalletTransactionFilter = 'All' | 'Deposits' | 'Withdrawals' | 'Rewards';

export function getWalletTransactions(wallet: Wallet | null | undefined): WalletTransaction[] {
    if (!wallet?.walletTransactions || !Array.isArray(wallet.walletTransactions)) {
        return [];
    }

    return wallet.walletTransactions
        .filter((item): item is WalletTransaction => typeof item === 'object' && item !== null && 'type' in item)
        .sort((a, b) => {
            const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return timeB - timeA;
        });
}

export function filterWalletTransactions(
    transactions: WalletTransaction[],
    filter: WalletTransactionFilter,
): WalletTransaction[] {
    if (filter === 'All') {
        return transactions;
    }

    const typeMap: Record<Exclude<WalletTransactionFilter, 'All'>, string> = {
        Deposits: 'deposit',
        Withdrawals: 'withdrawal',
        Rewards: 'reward',
    };

    const targetType = typeMap[filter];
    return transactions.filter((transaction) => String(transaction.type).toLowerCase() === targetType);
}

export function getWalletTransactionTypeLabel(type: string): string {
    const normalized = type.toLowerCase();
    if (normalized === 'deposit') return 'Deposit';
    if (normalized === 'withdrawal') return 'Withdrawal';
    if (normalized === 'reward') return 'Reward';
    return type;
}

export function formatWalletTransactionAmount(transaction: WalletTransaction): {
    label: string;
    className: string;
} {
    const type = String(transaction.type).toLowerCase();
    const amount = Math.abs(parseFloat(transaction.amount || '0'));

    if (type === 'reward') {
        return { label: 'Reward', className: 'text-terracotta' };
    }
    if (type === 'deposit') {
        return { label: `+ ₱${amount.toFixed(2)}`, className: 'text-brand' };
    }
    return { label: `− ₱${amount.toFixed(2)}`, className: 'text-red-500' };
}

export function formatTransactionDate(createdAt?: string): { date: string; time: string } {
    if (!createdAt) {
        return { date: '—', time: '' };
    }

    const parsed = new Date(createdAt);
    if (Number.isNaN(parsed.getTime())) {
        return { date: '—', time: '' };
    }

    return {
        date: parsed.toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' }),
        time: parsed.toLocaleTimeString('en-PH', { hour: 'numeric', minute: '2-digit' }),
    };
}
