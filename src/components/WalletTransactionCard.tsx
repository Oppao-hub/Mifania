import React from 'react';
import { mergeSurfaceCardStyle } from '../utils/cardStyles';
import { View, Text } from 'react-native';
import { WalletTransaction } from '../utils/types';
import {
  formatTransactionDate,
  formatWalletTransactionAmount,
  getWalletTransactionTypeLabel,
} from '../utils/wallet';

interface WalletTransactionCardProps {
  transaction: WalletTransaction;
}

const WalletTransactionCard: React.FC<WalletTransactionCardProps> = ({ transaction }) => {
  const { date, time } = formatTransactionDate(transaction.createdAt);
  const amount = formatWalletTransactionAmount(transaction);
  const typeLabel = getWalletTransactionTypeLabel(transaction.type);

  const badgeClass =
    typeLabel === 'Deposit'
      ? 'bg-brand/10'
      : typeLabel === 'Withdrawal'
        ? 'bg-red-50'
        : 'bg-terracotta/10';

  const badgeTextClass =
    typeLabel === 'Deposit'
      ? 'text-brand'
      : typeLabel === 'Withdrawal'
        ? 'text-red-500'
        : 'text-terracotta';

  return (
    <View className="bg-surface rounded-card p-4 mb-3 border border-border-color" style={mergeSurfaceCardStyle()}>
      <View className="flex-row justify-between items-start">
        <View className="flex-1 pr-3">
          <Text className="text-sm font-montserrat-bold text-dark-gray" numberOfLines={2}>
            {transaction.description || 'Wallet transaction'}
          </Text>
          <Text className="text-[10px] font-montserrat text-gray mt-1">#{transaction.id}</Text>
          <View className="flex-row items-center mt-2">
            <View className={`px-2 py-0.5 rounded-md ${badgeClass}`}>
              <Text className={`text-[10px] font-montserrat-bold uppercase ${badgeTextClass}`}>
                {typeLabel}
              </Text>
            </View>
          </View>
        </View>
        <Text className={`text-base font-montserrat-bold ${amount.className}`}>{amount.label}</Text>
      </View>
      <View className="mt-3 pt-3 border-t border-light-gray">
        <Text className="text-xs font-montserrat-bold text-dark-gray">{date}</Text>
        {time ? <Text className="text-[10px] font-montserrat text-gray">{time}</Text> : null}
      </View>
    </View>
  );
};

export default WalletTransactionCard;
