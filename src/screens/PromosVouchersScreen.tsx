import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CommonActions, useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { ROUTES } from '../utils';
import Header from '../components/Header';
import { useSelector } from 'react-redux';
import { RootState } from '../utils/types';
import { getLoyaltyPolicyApi } from '../app/api/reward';

const BRAND = '#5B8E68';
const PromosVouchersScreen = () => {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const token = useSelector((state: RootState) => state.authentication.data?.token);
    const availablePoints = useSelector((state: RootState) => state.wallet.wallet?.rewardPoints ?? 0);
    const currentPoints = route.params?.selectedRedeemPoints ?? 0;
    const [selectedRedeemPoints, setSelectedRedeemPoints] = useState<number>(Math.max(0, currentPoints));
    const [pointsPerCurrency, setPointsPerCurrency] = useState<number>(10);
    const [minOrderForRedemption, setMinOrderForRedemption] = useState<number>(100);
    const [maxRedemptionPercentage, setMaxRedemptionPercentage] = useState<number>(0.3);
    const checkoutTotal = Number(route.params?.checkoutTotal ?? 0);
    const sourceCheckoutRouteKey = route.params?.sourceCheckoutRouteKey as string | undefined;

    useEffect(() => {
        if (!token) return;
        getLoyaltyPolicyApi(token)
            .then((policy) => {
                setPointsPerCurrency(policy.pointsPerCurrency);
                setMinOrderForRedemption(policy.minOrderForRedemption);
                setMaxRedemptionPercentage(policy.maxRedemptionPercentage);
            })
            .catch(() => {
                // Keep defaults when policy endpoint is temporarily unavailable.
            });
    }, [token]);

    const maxPointsByBalance = useMemo(
        () => Math.max(0, Math.floor((availablePoints || 0) / pointsPerCurrency) * pointsPerCurrency),
        [availablePoints, pointsPerCurrency],
    );
    const maxPolicyDiscount = useMemo(() => {
        if (checkoutTotal < minOrderForRedemption) return 0;
        return checkoutTotal * maxRedemptionPercentage;
    }, [checkoutTotal, minOrderForRedemption, maxRedemptionPercentage]);
    const maxPointsByPolicy = useMemo(
        () => Math.floor(maxPolicyDiscount * pointsPerCurrency),
        [maxPolicyDiscount, pointsPerCurrency],
    );
    const maxRedeemablePoints = useMemo(
        () => Math.max(0, Math.min(maxPointsByBalance, maxPointsByPolicy)),
        [maxPointsByBalance, maxPointsByPolicy],
    );
    const pointsDiscount = useMemo(
        () => Number((selectedRedeemPoints / pointsPerCurrency).toFixed(2)),
        [selectedRedeemPoints, pointsPerCurrency],
    );

    const adjustPoints = (delta: number) => {
        setSelectedRedeemPoints((prev) => {
            const next = prev + delta;
            return Math.min(maxRedeemablePoints, Math.max(0, next));
        });
    };

    useEffect(() => {
        setSelectedRedeemPoints((prev) => Math.min(prev, maxRedeemablePoints));
    }, [maxRedeemablePoints]);

    const handleConfirm = () => {
        const nextParams = {
            selectedRedeemPoints,
            selectedRedeemDiscount: pointsDiscount,
            selectedRedeemRate: pointsPerCurrency,
        };

        if (sourceCheckoutRouteKey) {
            navigation.dispatch({
                ...CommonActions.setParams(nextParams),
                source: sourceCheckoutRouteKey,
            });
        } else {
            navigation.navigate({
                name: ROUTES.CHECKOUT,
                params: nextParams,
                merge: true,
            });
        }

        if (navigation.canGoBack()) {
            navigation.goBack();
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-app-bg" edges={['top']}>
            <Header title="Loyalty Redemption" />

            <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
                <View className="rounded-2xl bg-white border border-border-color p-4 mb-4">
                    <Text className="text-[17px] font-montserrat-bold text-dark-gray mb-3">
                        Redeem Your Points
                    </Text>
                    <View className="h-px bg-border-color mb-4" />
                    <Text className="text-sm font-montserrat text-gray mb-2">
                        Available: {availablePoints} pts
                    </Text>
                    <Text className="text-xs font-montserrat text-gray mb-4">
                        Conversion: {pointsPerCurrency} pts = ₱1.00
                    </Text>
                    {checkoutTotal < minOrderForRedemption ? (
                        <Text className="text-xs font-montserrat text-[#B45309] mb-4">
                            Minimum order for redemption is ₱{minOrderForRedemption.toFixed(2)}.
                        </Text>
                    ) : (
                        <Text className="text-xs font-montserrat text-gray mb-4">
                            Max redeem per order: {(maxRedemptionPercentage * 100).toFixed(0)}%
                        </Text>
                    )}

                    <View className="flex-row items-center justify-between">
                        <TouchableOpacity
                            onPress={() => adjustPoints(-pointsPerCurrency)}
                            className="w-12 h-12 rounded-full bg-brand/10 items-center justify-center"
                        >
                            <Icon name="remove" size={20} color={BRAND} />
                        </TouchableOpacity>
                        <View className="items-center">
                            <Text className="text-2xl font-montserrat-bold text-dark-gray">
                                {selectedRedeemPoints} pts
                            </Text>
                            <Text className="text-sm font-montserrat text-brand mt-1">
                                Discount: ₱{pointsDiscount.toFixed(2)}
                            </Text>
                        </View>
                        <TouchableOpacity
                            onPress={() => adjustPoints(pointsPerCurrency)}
                            className="w-12 h-12 rounded-full bg-brand items-center justify-center"
                        >
                            <Icon name="add" size={20} color="#fff" />
                        </TouchableOpacity>
                    </View>
                    <TouchableOpacity
                        activeOpacity={0.85}
                        onPress={() => setSelectedRedeemPoints(maxRedeemablePoints)}
                        className="mt-4 bg-brand/10 px-4 py-3 rounded-xl"
                    >
                        <Text className="text-brand font-montserrat-bold text-center">Use Max Points</Text>
                    </TouchableOpacity>
                </View>

                <View className="rounded-2xl bg-white border border-border-color p-4">
                    <Text className="text-sm font-montserrat text-gray leading-6">
                        Applied points are validated by backend at checkout, and actual discount may be capped based
                        on your order total.
                    </Text>
                </View>
            </ScrollView>

            <View className="px-5 py-4 bg-app-bg">
                <TouchableOpacity
                    activeOpacity={0.9}
                    onPress={handleConfirm}
                    className="w-full h-14 rounded-full bg-brand items-center justify-center"
                >
                    <Text className="text-white text-base font-montserrat-bold">OK</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

export default PromosVouchersScreen;
