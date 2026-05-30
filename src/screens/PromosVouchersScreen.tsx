import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CommonActions, useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { ROUTES } from '../utils';
import Header from '../components/Header';
import SurfaceCard from '../components/SurfaceCard';
import Button from '../components/Button';
import StickyBottomBar from '../components/StickyBottomBar';
import { useSelector } from 'react-redux';
import { RootState } from '../utils/types';
import { getLoyaltyPolicyApi } from '../app/api/reward';

const BRAND = '#52622E';
const PromosVouchersScreen = () => {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const token = useSelector((state: RootState) => state.authentication.data?.token);
    const availablePoints = useSelector((state: RootState) => state.wallet.wallet?.rewardPoints ?? 0);
    const currentPoints = route.params?.selectedRedeemPoints ?? 0;
    const [selectedRedeemPoints, setSelectedRedeemPoints] = useState<number>(Math.max(0, currentPoints));
    const [pointsInput, setPointsInput] = useState<string>(String(Math.max(0, currentPoints)));
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

    const clampPoints = (value: number) =>
        Math.min(maxRedeemablePoints, Math.max(0, Math.floor(value)));

    const applyPoints = (value: number) => {
        const clamped = clampPoints(value);
        setSelectedRedeemPoints(clamped);
        setPointsInput(String(clamped));
    };

    const adjustPoints = (delta: number) => {
        applyPoints(selectedRedeemPoints + delta);
    };

    const handlePointsInputChange = (text: string) => {
        const digitsOnly = text.replace(/\D/g, '');
        setPointsInput(digitsOnly);
        if (digitsOnly === '') {
            setSelectedRedeemPoints(0);
            return;
        }
        const parsed = parseInt(digitsOnly, 10);
        if (!Number.isNaN(parsed)) {
            setSelectedRedeemPoints(clampPoints(parsed));
        }
    };

    const handlePointsInputEnd = () => {
        const parsed = pointsInput === '' ? 0 : parseInt(pointsInput, 10);
        applyPoints(Number.isNaN(parsed) ? 0 : parsed);
    };

    useEffect(() => {
        setSelectedRedeemPoints((prev) => {
            const clamped = Math.min(prev, maxRedeemablePoints);
            setPointsInput(String(clamped));
            return clamped;
        });
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
            <Header title="Loyalty Redemption" hideNotificationBell />

            <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
                <SurfaceCard className="p-4 mb-4">
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
                        <View className="items-center flex-1 mx-3">
                            <View className="flex-row items-baseline justify-center">
                                <TextInput
                                    value={pointsInput}
                                    onChangeText={handlePointsInputChange}
                                    onBlur={handlePointsInputEnd}
                                    onSubmitEditing={handlePointsInputEnd}
                                    keyboardType="number-pad"
                                    inputMode="numeric"
                                    returnKeyType="done"
                                    selectTextOnFocus
                                    maxLength={8}
                                    className="text-2xl font-montserrat-bold text-dark-gray text-center min-w-[72px] px-2 py-1"
                                />
                                <Text className="text-2xl font-montserrat-bold text-dark-gray ml-1">
                                    pts
                                </Text>
                            </View>
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
                        onPress={() => applyPoints(maxRedeemablePoints)}
                        className="mt-4 bg-brand/10 px-4 py-3 rounded-xl"
                    >
                        <Text className="text-brand font-montserrat-bold text-center">Use Max Points</Text>
                    </TouchableOpacity>
                </SurfaceCard>

                <SurfaceCard className="p-4">
                    <Text className="text-sm font-montserrat text-gray leading-6">
                        Applied points are validated by backend at checkout, and actual discount may be capped based
                        on your order total.
                    </Text>
                </SurfaceCard>
            </ScrollView>

            <StickyBottomBar>
                <Button label="OK" onPress={handleConfirm} size="md" shape="pill" />
            </StickyBottomBar>
        </SafeAreaView>
    );
};

export default PromosVouchersScreen;
