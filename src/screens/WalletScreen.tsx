import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  Linking,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { useScreenLiveSync } from '../hooks/useLiveSync';
import { LIVE_SYNC_POLL_MS } from '../config/realtime';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';

import Header from '../components/Header';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';
import LoadingState from '../components/LoadingState';
import WalletTransactionCard from '../components/WalletTransactionCard';
import CustomModal from '../components/CustomModal';
import Button from '../components/Button';
import FormFieldError from '../components/FormFieldError';
import { showBlockingError, showFeedbackToast } from '../utils/userFeedback';
import { RootState } from '../utils/types';
import { ROUTES } from '../utils';
import * as Types from '../app/actions';
import { topUpWalletApi, transferWalletApi, preparePayPalTopUpApi } from '../app/api/wallet';
import { ASSET_URL } from '../app/api/client';
import { getCustomerRefFromUser } from '../utils/apiResource';
import { mergeSurfaceCardStyle } from '../utils/cardStyles';
import {
  filterWalletTransactions,
  getWalletTransactions,
  WALLET_TOP_UP_PRESETS,
  WalletTransactionFilter,
} from '../utils/wallet';

const FILTERS: WalletTransactionFilter[] = ['All', 'Deposits', 'Withdrawals', 'Rewards'];

const parseAmount = (value: string): number | null => {
  const parsed = Number.parseFloat(value.replace(/,/g, '').trim());
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return null;
  }
  return Math.round(parsed * 100) / 100;
};

const WalletScreen = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation<any>();
  const [activeFilter, setActiveFilter] = useState<WalletTransactionFilter>('All');
  const [refreshing, setRefreshing] = useState(false);
  const [showTopUpModal, setShowTopUpModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showTransferConfirm, setShowTransferConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<number | null>(null);

  const [topUpAmount, setTopUpAmount] = useState('');
  const [topUpNote, setTopUpNote] = useState('');
  const [transferEmail, setTransferEmail] = useState('');
  const [transferAmount, setTransferAmount] = useState('');
  const [transferNote, setTransferNote] = useState('');
  const [topUpFormError, setTopUpFormError] = useState<string | null>(null);
  const [transferFormError, setTransferFormError] = useState<string | null>(null);

  const { data: authData } = useSelector((state: RootState) => state.authentication);
  const { wallet, isLoading, isError, error } = useSelector((state: RootState) => state.wallet);

  const token = authData?.token;
  const customerRef = getCustomerRefFromUser(authData?.user);

  const fetchWallet = useCallback(() => {
    if (token && customerRef) {
      dispatch({ type: Types.GET_WALLET, payload: { id: customerRef, token } });
    }
  }, [token, customerRef, dispatch]);

  useScreenLiveSync(fetchWallet, LIVE_SYNC_POLL_MS, Boolean(token && customerRef));

  const onRefresh = async () => {
    setRefreshing(true);
    fetchWallet();
    setTimeout(() => setRefreshing(false), 800);
  };

  const resetTopUpForm = () => {
    setTopUpAmount('');
    setTopUpNote('');
    setSelectedPreset(null);
    setTopUpFormError(null);
  };

  const resetTransferForm = () => {
    setTransferEmail('');
    setTransferAmount('');
    setTransferNote('');
    setShowTransferConfirm(false);
    setTransferFormError(null);
  };

  const currentBalance = parseFloat(wallet?.balance || '0');

  const handleSelectPreset = (preset: number) => {
    setSelectedPreset(preset);
    setTopUpAmount(String(preset));
  };

  const handleTopUpAmountChange = (value: string) => {
    setTopUpAmount(value);
    setTopUpFormError(null);
    const parsed = parseAmount(value);
    setSelectedPreset(
      parsed != null && (WALLET_TOP_UP_PRESETS as readonly number[]).includes(parsed) ? parsed : null,
    );
  };

  const handleTopUp = async () => {
    if (!token) return;

    const amount = parseAmount(topUpAmount);
    if (amount == null) {
      setTopUpFormError('Enter an amount greater than zero.');
      return;
    }

    setTopUpFormError(null);
    setIsSubmitting(true);
    try {
      const result = await topUpWalletApi(token, {
        amount,
        description: topUpNote.trim() || undefined,
      });
      setShowTopUpModal(false);
      resetTopUpForm();
      fetchWallet();
      showFeedbackToast(result.message || `Top up successful. New balance: ₱${result.balance}.`);
    } catch (err) {
      showBlockingError({
        title: 'Top up failed',
        message: err instanceof Error ? err.message : 'Unable to top up wallet.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePayPalTopUp = async () => {
    if (!token) return;

    const amount = parseAmount(topUpAmount);
    if (amount == null) {
      setTopUpFormError('Enter an amount greater than zero.');
      return;
    }

    setTopUpFormError(null);
    setIsSubmitting(true);
    try {
      const { prepareToken } = await preparePayPalTopUpApi(token, { amount });
      const paypalUrl =
        `${ASSET_URL}/paypal/payment?amount=${encodeURIComponent(amount.toFixed(2))}` +
        `&purpose=wallet&prepare=${encodeURIComponent(prepareToken)}`;

      setShowTopUpModal(false);
      resetTopUpForm();

      const opened = await Linking.openURL(paypalUrl);
      if (!opened) {
        throw new Error('Unable to open PayPal checkout.');
      }

      Alert.alert(
        'Complete PayPal payment',
        'Finish payment in your browser, then return to Mifania. Your wallet balance will refresh automatically.',
      );
    } catch (err) {
      showBlockingError({
        title: 'PayPal top-up',
        message: err instanceof Error ? err.message : 'Unable to start PayPal top-up.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const validateTransferDetails = (): { amount: number; recipientEmail: string } | null => {
    const amount = parseAmount(transferAmount);
    const recipientEmail = transferEmail.trim().toLowerCase();

    if (!recipientEmail) {
      setTransferFormError('Enter the recipient email address.');
      return null;
    }

    if (amount == null) {
      setTransferFormError('Enter an amount greater than zero.');
      return null;
    }

    if (amount > currentBalance) {
      setTransferFormError(`Your available balance is ₱${currentBalance.toFixed(2)}.`);
      return null;
    }

    setTransferFormError(null);
    return { amount, recipientEmail };
  };

  const handleReviewTransfer = () => {
    const details = validateTransferDetails();
    if (!details) return;
    setShowTransferConfirm(true);
  };

  const handleTransfer = async () => {
    if (!token) return;

    const details = validateTransferDetails();
    if (!details) return;

    const { amount, recipientEmail } = details;

    setIsSubmitting(true);
    try {
      const result = await transferWalletApi(token, {
        recipientEmail,
        amount,
        note: transferNote.trim() || undefined,
      });
      setShowTransferModal(false);
      setShowTransferConfirm(false);
      resetTransferForm();
      fetchWallet();
      showFeedbackToast(result.message || `Transfer successful. New balance: ₱${result.balance}.`);
    } catch (err) {
      showBlockingError({
        title: 'Transfer failed',
        message: err instanceof Error ? err.message : 'Unable to transfer funds.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const allTransactions = useMemo(() => getWalletTransactions(wallet), [wallet]);
  const filteredTransactions = useMemo(
    () => filterWalletTransactions(allTransactions, activeFilter),
    [allTransactions, activeFilter],
  );

  const inputClass =
    'w-full border border-border-color rounded-xl px-4 py-3 text-sm font-montserrat text-dark-gray bg-white';

  return (
    <SafeAreaView className="flex-1 bg-app-bg" edges={['top']}>
      <Header title="My Wallet" hideNotificationBell />

      <View className="px-6 pt-2">
        <View className="bg-brand rounded-2xl p-5 mb-4 shadow-sm">
          <Text className="text-xs font-montserrat-medium text-white/80 uppercase tracking-widest mb-1">
            Total Balance
          </Text>
          <Text className="text-3xl font-montserrat-bold text-white">
            ₱{wallet?.balance || '0.00'}
          </Text>
          <Text className="text-sm font-montserrat-medium text-white/90 mt-2">
            {wallet?.rewardPoints ?? 0} reward points
          </Text>

          <View className="flex-row gap-3 mt-4">
            <TouchableOpacity
              onPress={() => setShowTopUpModal(true)}
              className="flex-1 flex-row items-center justify-center bg-white py-2.5 rounded-xl"
            >
              <Icon name="add-circle-outline" size={18} color="#52622E" />
              <Text className="ml-1.5 text-xs font-montserrat-bold text-brand">Top Up</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => navigation.navigate(ROUTES.REWARDS as never)}
              className="flex-1 flex-row items-center justify-center bg-white py-2.5 rounded-xl"
            >
              <Icon name="gift-outline" size={18} color="#52622E" />
              <Text className="ml-1.5 text-xs font-montserrat-bold text-brand">Rewards</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setShowTransferModal(true)}
              className="flex-1 flex-row items-center justify-center bg-white/20 border border-white/30 py-2.5 rounded-xl"
            >
              <Icon name="swap-horizontal-outline" size={18} color="#FFFFFF" />
              <Text className="ml-1.5 text-xs font-montserrat-bold text-white">Transfer</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Text className="text-xs font-montserrat-bold text-dark-gray mb-2 ml-1 uppercase tracking-widest">
          Transaction History
        </Text>

        <View
            className="flex-row bg-white border border-border-color p-1 rounded-2xl mb-4"
            style={mergeSurfaceCardStyle()}
        >
          {FILTERS.map((tab) => (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveFilter(tab)}
              className={`flex-1 py-2 rounded-xl items-center ${activeFilter === tab ? 'bg-brand' : 'bg-transparent'}`}
            >
              <Text
                className={`font-montserrat-bold text-[9px] ${activeFilter === tab ? 'text-white' : 'text-gray'}`}
              >
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {isError && !wallet ? (
        <ErrorState error={error} context="wallet" onRetry={fetchWallet} />
      ) : null}

      {isLoading && !wallet ? (
        <LoadingState message="Loading wallet..." />
      ) : (
        <FlatList
          data={filteredTransactions}
          keyExtractor={(item, index) => item.id?.toString() || index.toString()}
          renderItem={({ item }) => <WalletTransactionCard transaction={item} />}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            { paddingHorizontal: 24, paddingBottom: 40 },
            filteredTransactions.length === 0 && { flexGrow: 1, justifyContent: 'center' },
          ]}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#52622E']}
              tintColor="#52622E"
            />
          }
          ListEmptyComponent={
            <EmptyState
              iconName="wallet-outline"
              title={allTransactions.length > 0 ? `No ${activeFilter} Transactions` : 'No Transactions Yet'}
              description={
                allTransactions.length > 0
                  ? `You don't have any ${activeFilter.toLowerCase()} transactions at the moment.`
                  : "You haven't made any wallet transactions yet. Top up or shop to see activity here."
              }
              buttonText={allTransactions.length === 0 ? 'Start Shopping' : undefined}
              onButtonPress={
                allTransactions.length === 0 ? () => navigation.navigate('HomeTab' as never) : undefined
              }
            />
          }
        />
      )}

      <CustomModal
        visible={showTopUpModal}
        onClose={() => {
          if (!isSubmitting) {
            setShowTopUpModal(false);
            resetTopUpForm();
          }
        }}
        title="Top Up Wallet"
        message="Pay with PayPal or add demo funds instantly (no real payment)."
        isLoading={isSubmitting}
        primaryButtonText="Pay with PayPal"
        onPrimaryAction={handlePayPalTopUp}
        secondaryButtonText="Cancel"
        onSecondaryAction={() => {
          setShowTopUpModal(false);
          resetTopUpForm();
        }}
      >
        <View className="gap-3">
          <View>
            <Text className="text-xs font-montserrat-bold text-gray mb-2">Quick amounts</Text>
            <View className="flex-row gap-2">
              {WALLET_TOP_UP_PRESETS.map((preset) => (
                <TouchableOpacity
                  key={preset}
                  onPress={() => handleSelectPreset(preset)}
                  disabled={isSubmitting}
                  className={`flex-1 py-2.5 rounded-xl border items-center ${
                    selectedPreset === preset
                      ? 'bg-brand border-brand'
                      : 'bg-white border-border-color'
                  }`}
                >
                  <Text
                    className={`text-xs font-montserrat-bold ${
                      selectedPreset === preset ? 'text-white' : 'text-dark-gray'
                    }`}
                  >
                    ₱{preset}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          <View>
            <Text className="text-xs font-montserrat-bold text-gray mb-1">Amount (PHP)</Text>
            <TextInput
              value={topUpAmount}
              onChangeText={handleTopUpAmountChange}
              keyboardType="decimal-pad"
              placeholder="0.00"
              className={inputClass}
              editable={!isSubmitting}
            />
            <FormFieldError message={topUpFormError} />
          </View>
          <TouchableOpacity
            onPress={handleTopUp}
            disabled={isSubmitting}
            className="py-2 items-center"
          >
            <Text className="text-xs font-montserrat-bold text-brand">
              Add demo funds (no real payment)
            </Text>
          </TouchableOpacity>
          <View>
            <Text className="text-xs font-montserrat-bold text-gray mb-1">Note (optional)</Text>
            <TextInput
              value={topUpNote}
              onChangeText={setTopUpNote}
              placeholder="e.g. Loaded via GCash"
              className={inputClass}
              editable={!isSubmitting}
            />
          </View>
        </View>
      </CustomModal>

      <CustomModal
        visible={showTransferModal && !showTransferConfirm}
        onClose={() => {
          if (!isSubmitting) {
            setShowTransferModal(false);
            resetTransferForm();
          }
        }}
        title="Transfer Funds"
        message="Send wallet balance to another Mifania customer by email."
        isLoading={isSubmitting}
        primaryButtonText="Review Transfer"
        onPrimaryAction={handleReviewTransfer}
        secondaryButtonText="Cancel"
        onSecondaryAction={() => {
          setShowTransferModal(false);
          resetTransferForm();
        }}
      >
        <View className="gap-3">
          <View>
            <Text className="text-xs font-montserrat-bold text-gray mb-1">Recipient email</Text>
            <TextInput
              value={transferEmail}
              onChangeText={(text) => {
                setTransferEmail(text);
                setTransferFormError(null);
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholder="friend@example.com"
              className={inputClass}
              editable={!isSubmitting}
            />
          </View>
          <View>
            <Text className="text-xs font-montserrat-bold text-gray mb-1">Amount (PHP)</Text>
            <TextInput
              value={transferAmount}
              onChangeText={(text) => {
                setTransferAmount(text);
                setTransferFormError(null);
              }}
              keyboardType="decimal-pad"
              placeholder="0.00"
              className={inputClass}
              editable={!isSubmitting}
            />
            <Text className="text-[10px] font-montserrat text-gray mt-1">
              Available: ₱{currentBalance.toFixed(2)}
            </Text>
          </View>
          <View>
            <Text className="text-xs font-montserrat-bold text-gray mb-1">Note (optional)</Text>
            <TextInput
              value={transferNote}
              onChangeText={setTransferNote}
              placeholder="e.g. Shared lunch fund"
              className={inputClass}
              editable={!isSubmitting}
            />
          </View>
          <FormFieldError message={transferFormError} />
        </View>
      </CustomModal>

      <CustomModal
        visible={showTransferModal && showTransferConfirm}
        onClose={() => {
          if (!isSubmitting) {
            setShowTransferConfirm(false);
          }
        }}
        title="Confirm Transfer"
        message="Please review your transfer. This cannot be undone."
        iconName="swap-horizontal"
        isLoading={isSubmitting}
        primaryButtonText="Yes, Send Transfer"
        onPrimaryAction={handleTransfer}
        secondaryButtonText="Back"
        onSecondaryAction={() => setShowTransferConfirm(false)}
      >
        <View className="bg-light-gray rounded-2xl p-4 border border-border-color gap-3 w-full">
          <View className="flex-row justify-between items-start">
            <Text className="text-xs font-montserrat-bold text-gray">Recipient</Text>
            <Text className="text-sm font-montserrat-bold text-dark-gray text-right flex-1 ml-4">
              {transferEmail.trim().toLowerCase()}
            </Text>
          </View>
          <View className="flex-row justify-between items-center">
            <Text className="text-xs font-montserrat-bold text-gray">Amount</Text>
            <Text className="text-base font-montserrat-bold text-red-500">
              − ₱{parseAmount(transferAmount)?.toFixed(2) ?? '0.00'}
            </Text>
          </View>
          {transferNote.trim() ? (
            <View className="flex-row justify-between items-start">
              <Text className="text-xs font-montserrat-bold text-gray">Note</Text>
              <Text className="text-sm font-montserrat text-dark-gray text-right flex-1 ml-4">
                {transferNote.trim()}
              </Text>
            </View>
          ) : null}
        </View>
      </CustomModal>
    </SafeAreaView>
  );
};

export default WalletScreen;
