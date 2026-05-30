import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';

import Header from '../components/Header';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';
import LoadingState from '../components/LoadingState';
import SurfaceCard from '../components/SurfaceCard';
import CustomModal from '../components/CustomModal';
import Button from '../components/Button';
import { showBlockingError, showFeedbackToast } from '../utils/userFeedback';
import { RootState, Reward, Redemption } from '../utils/types';
import * as Types from '../app/actions';
import { resolveResourceIri } from '../utils/apiResource';
import { mergeSurfaceCardStyle } from '../utils/cardStyles';

type RewardsTab = 'catalog' | 'history';

const getRewardFromRedemption = (redemption: Redemption): Reward | null => {
  const reward = redemption.reward;
  if (!reward || typeof reward === 'string') return null;
  return reward;
};

const RewardsScreen = () => {
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState<RewardsTab>('catalog');
  const [refreshing, setRefreshing] = useState(false);
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null);
  const [claimStarted, setClaimStarted] = useState(false);

  const { data: authData } = useSelector((state: RootState) => state.authentication);
  const { wallet, rewards, redemptions, isLoading, isError, error, isRedeeming, redemptionError } = useSelector(
    (state: RootState) => state.wallet,
  );

  const token = authData?.token;
  const availablePoints = wallet?.rewardPoints ?? 0;

  const fetchRewardsData = useCallback(() => {
    if (!token) return;
    dispatch({ type: Types.GET_REWARDS, payload: token });
    dispatch({ type: Types.GET_REDEMPTIONS, payload: token });
  }, [token, dispatch]);

  useFocusEffect(
    useCallback(() => {
      fetchRewardsData();
    }, [fetchRewardsData]),
  );

  const onRefresh = async () => {
    setRefreshing(true);
    fetchRewardsData();
    setTimeout(() => setRefreshing(false), 800);
  };

  useEffect(() => {
    if (!claimStarted || isRedeeming) return;

    if (redemptionError) {
      showBlockingError({
        title: 'Claim failed',
        message: redemptionError || 'Unable to claim this reward. Please try again.',
      });
    } else {
      setSelectedReward(null);
      showFeedbackToast('Reward claimed successfully.');
    }

    setClaimStarted(false);
  }, [claimStarted, isRedeeming, redemptionError]);

  const activeRewards = useMemo(
    () => rewards.filter((reward) => reward.isActive !== false),
    [rewards],
  );

  const sortedRedemptions = useMemo(
    () =>
      [...redemptions].sort((a, b) => {
        const aTime = a.redeemedAt ? new Date(a.redeemedAt).getTime() : 0;
        const bTime = b.redeemedAt ? new Date(b.redeemedAt).getTime() : 0;
        return bTime - aTime;
      }),
    [redemptions],
  );

  const handleConfirmClaim = () => {
    if (!token || !selectedReward) return;

    const rewardIri = resolveResourceIri(selectedReward, 'rewards');
    if (!rewardIri) {
      showBlockingError({ title: 'Unable to claim', message: 'Invalid reward reference.' });
      return;
    }

    setClaimStarted(true);
    dispatch({
      type: Types.CREATE_REDEMPTION,
      payload: {
        rewardIri,
        token,
        pointsCost: selectedReward.pointsRequired,
      },
    });
  };

  const renderRewardCard = ({ item }: { item: Reward }) => {
    const canAfford = availablePoints >= item.pointsRequired;

    return (
      <SurfaceCard className="p-4 mb-3">
        <View className="flex-row items-start justify-between mb-2">
          <View className="flex-1 pr-3">
            <Text className="text-base font-montserrat-bold text-dark-gray">{item.name}</Text>
            {item.description ? (
              <Text className="text-sm font-montserrat text-gray mt-1 leading-5">{item.description}</Text>
            ) : null}
          </View>
          <View className="bg-brand/10 px-3 py-1.5 rounded-full">
            <Text className="text-xs font-montserrat-bold text-brand">{item.pointsRequired} pts</Text>
          </View>
        </View>

        <Button
          label={canAfford ? 'Claim Reward' : 'Not Enough Points'}
          onPress={() => setSelectedReward(item)}
          size="sm"
          shape="pill"
          disabled={!canAfford}
        />
      </SurfaceCard>
    );
  };

  const renderRedemptionCard = ({ item }: { item: Redemption }) => {
    const reward = getRewardFromRedemption(item);
    const statusColor =
      item.status === 'FULFILLED' || item.status === 'COMPLETED'
        ? 'text-brand'
        : item.status === 'CANCELLED'
          ? 'text-danger'
          : 'text-[#B45309]';

    return (
      <SurfaceCard className="p-4 mb-3">
        <View className="flex-row items-start justify-between">
          <View className="flex-1 pr-3">
            <Text className="text-base font-montserrat-bold text-dark-gray">
              {reward?.name ?? 'Reward redemption'}
            </Text>
            <Text className="text-sm font-montserrat text-gray mt-1">
              {item.pointSpent} points spent
            </Text>
            {item.redeemedAt ? (
              <Text className="text-xs font-montserrat text-gray mt-1">
                {new Date(item.redeemedAt).toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </Text>
            ) : null}
          </View>
          <Text className={`text-xs font-montserrat-bold uppercase ${statusColor}`}>{item.status}</Text>
        </View>
      </SurfaceCard>
    );
  };

  const listData = activeTab === 'catalog' ? activeRewards : sortedRedemptions;
  const showInitialLoader = isLoading && !rewards.length && !redemptions.length;

  return (
    <SafeAreaView className="flex-1 bg-app-bg" edges={['top']}>
      <Header title="Rewards" hideNotificationBell />

      <View className="px-6 pt-2">
        <View className="bg-brand rounded-2xl p-5 mb-4 shadow-sm">
          <Text className="text-xs font-montserrat-medium text-white/80 uppercase tracking-widest mb-1">
            Available Points
          </Text>
          <Text className="text-3xl font-montserrat-bold text-white">{availablePoints} pts</Text>
          <Text className="text-sm font-montserrat-medium text-white/90 mt-2">
            Claim rewards using your loyalty points
          </Text>
        </View>

        <View
          className="flex-row bg-white border border-border-color p-1 rounded-2xl mb-4"
          style={mergeSurfaceCardStyle()}
        >
          {(['catalog', 'history'] as RewardsTab[]).map((tab) => (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTab(tab)}
              className={`flex-1 py-2.5 rounded-xl items-center ${activeTab === tab ? 'bg-brand' : 'bg-transparent'}`}
            >
              <Text
                className={`font-montserrat-bold text-xs ${activeTab === tab ? 'text-white' : 'text-gray'}`}
              >
                {tab === 'catalog' ? 'Catalog' : 'My Redemptions'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {isError && !rewards.length && !redemptions.length ? (
        <ErrorState error={error} context="rewards" onRetry={fetchRewardsData} />
      ) : showInitialLoader ? (
        <LoadingState message="Loading rewards..." />
      ) : (
        <FlatList
          data={listData as Reward[] | Redemption[]}
          keyExtractor={(item, index) => item['@id']?.toString() || item.id?.toString() || index.toString()}
          renderItem={
            activeTab === 'catalog'
              ? (renderRewardCard as any)
              : (renderRedemptionCard as any)
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            { paddingHorizontal: 24, paddingBottom: 40 },
            listData.length === 0 && { flexGrow: 1, justifyContent: 'center' },
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
              iconName={activeTab === 'catalog' ? 'gift-outline' : 'time-outline'}
              title={activeTab === 'catalog' ? 'No Rewards Available' : 'No Redemptions Yet'}
              description={
                activeTab === 'catalog'
                  ? 'Check back later for new rewards you can claim with your points.'
                  : 'When you claim a reward, it will appear here.'
              }
            />
          }
        />
      )}

      <CustomModal
        visible={selectedReward != null}
        onClose={() => {
          if (!isRedeeming) setSelectedReward(null);
        }}
        title="Claim Reward"
        message={
          selectedReward
            ? `Spend ${selectedReward.pointsRequired} points to claim "${selectedReward.name}"?`
            : undefined
        }
        iconName="gift-outline"
        isLoading={isRedeeming}
        primaryButtonText="Yes, Claim"
        onPrimaryAction={handleConfirmClaim}
        secondaryButtonText="Cancel"
        onSecondaryAction={() => setSelectedReward(null)}
      />
    </SafeAreaView>
  );
};

export default RewardsScreen;
