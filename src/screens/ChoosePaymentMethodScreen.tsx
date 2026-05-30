import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CommonActions, useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { ROUTES } from '../utils';
import Header from '../components/Header';
import SelectableOptionCard from '../components/SelectableOptionCard';
import { RootState } from '../utils/types';
import Button from '../components/Button';
import ConfirmationBottomSheet from '../components/ConfirmationBottomSheet';
import StickyBottomBar from '../components/StickyBottomBar';
import EmptyState from '../components/EmptyState';
import LoadingState from '../components/LoadingState';
import PaymentOptionIcon from '../components/PaymentOptionIcon';
import { fetchPaymentOptions, PaymentOption } from '../utils/checkoutOptions';
import { parseCurrencyAmount } from '../utils/checkout';
import { PaymentMethods } from '../constants/Payment';
import { getCustomerRefFromUser } from '../utils/apiResource';
import * as Types from '../app/actions';

const ChoosePaymentMethodScreen = () => {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const dispatch = useDispatch();
    const token = useSelector((state: RootState) => state.authentication.data?.token);
    const wallet = useSelector((state: RootState) => state.wallet.wallet);
    const customerRef = getCustomerRefFromUser(
        useSelector((state: RootState) => state.authentication.data?.user),
    );
    const [paymentOptions, setPaymentOptions] = useState<PaymentOption[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);
    const accountMode = route.params?.accountMode === true;
    const sourceCheckoutRouteKey = route.params?.sourceCheckoutRouteKey as string | undefined;
    const initialPaymentId = route.params?.selectedPaymentId || 'cash';
    const checkoutTotal = Number(route.params?.checkoutTotal ?? 0);
    const walletBalance = parseCurrencyAmount(wallet?.balance ?? '0');
    const [selectedPaymentId, setSelectedPaymentId] = useState<string>(initialPaymentId);
    const [walletTopUpSheetVisible, setWalletTopUpSheetVisible] = useState(false);

    const selectedPayment = useMemo(
        () => paymentOptions.find((item) => item.id === selectedPaymentId) ?? paymentOptions[0],
        [selectedPaymentId, paymentOptions],
    );

    const loadPaymentOptions = React.useCallback(async () => {
        if (!token) {
            setIsLoading(false);
            return;
        }
        setIsLoading(true);
        setLoadError(null);
        try {
            const options = await fetchPaymentOptions(token, { refresh: true });
            setPaymentOptions(options);
            setSelectedPaymentId((current) =>
                options.some((opt) => opt.id === current) ? current : options[0]?.id || 'cash',
            );
        } catch {
            setLoadError('Unable to load payment methods. Please try again.');
            setPaymentOptions([]);
        } finally {
            setIsLoading(false);
        }
    }, [token]);

    useFocusEffect(
        React.useCallback(() => {
            loadPaymentOptions();
            if (token && customerRef) {
                dispatch({ type: Types.GET_WALLET, payload: { id: customerRef, token } });
            }
        }, [loadPaymentOptions, token, customerRef, dispatch]),
    );

    const isWalletOptionDisabled = (option: PaymentOption): boolean => {
        if (option.backendMethod !== PaymentMethods.WALLET) {
            return false;
        }
        if (checkoutTotal <= 0) {
            return false;
        }
        return walletBalance < checkoutTotal;
    };

    const walletShortfall = Math.max(0, checkoutTotal - walletBalance);

    const getOptionDescription = (option: PaymentOption): string | undefined => {
        if (option.backendMethod === PaymentMethods.WALLET) {
            const balanceLabel = `Balance: ₱${walletBalance.toFixed(2)}`;
            if (checkoutTotal > 0 && walletShortfall > 0) {
                return `${balanceLabel} · Short ₱${walletShortfall.toFixed(2)} for this order`;
            }
            return balanceLabel;
        }
        return option.description;
    };

    const handlePaymentOptionPress = (item: PaymentOption) => {
        if (isWalletOptionDisabled(item)) {
            setWalletTopUpSheetVisible(true);
            return;
        }
        setSelectedPaymentId(item.id);
    };

    const handleWalletTopUpConfirm = () => {
        setWalletTopUpSheetVisible(false);
        navigation.navigate(ROUTES.WALLET as never);
    };

    const handleConfirm = () => {
        if (!selectedPayment) {
            return;
        }
        if (isWalletOptionDisabled(selectedPayment)) {
            return;
        }

        const nextParams = {
            selectedPaymentId: selectedPayment.id,
            selectedPaymentLabel: selectedPayment.name,
            selectedBackendPaymentMethod: selectedPayment.backendMethod,
            selectedPaymentGatewayType: selectedPayment.gatewayType,
        };

        if (accountMode) {
            if (navigation.canGoBack()) {
                navigation.goBack();
            }
            return;
        }

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

    if (isLoading) {
        return (
            <SafeAreaView className="flex-1 bg-app-bg" edges={['top']}>
                <Header title={accountMode ? 'Payment Methods' : 'Choose Payment Methods'} hideNotificationBell />
                <LoadingState message="Loading payment methods..." />
            </SafeAreaView>
        );
    }

    if (loadError) {
        return (
            <SafeAreaView className="flex-1 bg-app-bg" edges={['top']}>
                <Header title={accountMode ? 'Payment Methods' : 'Choose Payment Methods'} hideNotificationBell />
                <EmptyState
                    iconName="cloud-off-outline"
                    title="Could not load payment methods"
                    description={loadError}
                    buttonText="Try again"
                    onButtonPress={loadPaymentOptions}
                />
            </SafeAreaView>
        );
    }

    if (paymentOptions.length === 0) {
        return (
            <SafeAreaView className="flex-1 bg-app-bg" edges={['top']}>
                <Header title={accountMode ? 'Payment Methods' : 'Choose Payment Methods'} hideNotificationBell />
                <View className="flex-1 items-center justify-center px-6">
                    <Text className="text-sm font-montserrat text-gray text-center">
                        No payment methods available right now.
                    </Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-app-bg" edges={['top']}>
            <Header title={accountMode ? 'Payment Methods' : 'Choose Payment Methods'} hideNotificationBell />

            <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
                {paymentOptions.map((item) => {
                    const selected = item.id === selectedPaymentId;
                    const disabled = isWalletOptionDisabled(item);
                    return (
                        <SelectableOptionCard
                            key={item.id}
                            selected={selected}
                            disabled={disabled}
                            onPress={() => handlePaymentOptionPress(item)}
                            className="py-5"
                            left={<PaymentOptionIcon option={item} size={56} />}
                            title={item.name}
                            description={getOptionDescription(item)}
                        />
                    );
                })}
            </ScrollView>

            <StickyBottomBar>
                <Button
                    label={accountMode ? 'Done' : 'OK'}
                    onPress={handleConfirm}
                    disabled={isLoading || !selectedPayment || isWalletOptionDisabled(selectedPayment)}
                    size="md"
                    shape="pill"
                />
            </StickyBottomBar>

            <ConfirmationBottomSheet
                visible={walletTopUpSheetVisible}
                title="Insufficient wallet balance"
                titleTone="brand"
                message={`This order needs ₱${checkoutTotal.toFixed(2)}. Your wallet has ₱${walletBalance.toFixed(2)}.`}
                description={`Top up at least ₱${walletShortfall.toFixed(2)} to pay with Mifania Wallet.`}
                cancelLabel="Not now"
                confirmLabel="Top up wallet"
                onCancel={() => setWalletTopUpSheetVisible(false)}
                onConfirm={handleWalletTopUpConfirm}
            />
        </SafeAreaView>
    );
};

export default ChoosePaymentMethodScreen;
