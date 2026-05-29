import React, { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CommonActions, useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useDispatch, useSelector } from 'react-redux';
import { ROUTES } from '../utils';
import Header from '../components/Header';
import { mergeSurfaceCardStyle, SURFACE_CARD_CLASS } from '../utils/cardStyles';
import { RootState } from '../utils/types';
import Button from '../components/Button';
import StickyBottomBar from '../components/StickyBottomBar';
import EmptyState from '../components/EmptyState';
import { fetchPaymentOptions, PaymentOption } from '../utils/checkoutOptions';
import { parseCurrencyAmount } from '../utils/checkout';
import { PaymentMethods } from '../constants/Payment';
import { getCustomerRefFromUser } from '../utils/apiResource';
import * as Types from '../app/actions';

const BRAND = '#52622E';

const paymentIconName = (option: PaymentOption): string => {
    const key = `${option.id} ${option.name} ${option.backendMethod}`.toLowerCase();
    if (key.includes('wallet')) return 'wallet-outline';
    if (key.includes('paypal')) return 'logo-paypal';
    if (key.includes('cash')) return 'cash-outline';
    if (key.includes('bank')) return 'business-outline';
    return 'card-outline';
};

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

    const getOptionDescription = (option: PaymentOption): string | undefined => {
        if (option.backendMethod === PaymentMethods.WALLET) {
            const balanceLabel = `Balance: ₱${walletBalance.toFixed(2)}`;
            if (checkoutTotal > 0 && walletBalance < checkoutTotal) {
                return `${balanceLabel} · Need ₱${checkoutTotal.toFixed(2)}`;
            }
            return balanceLabel;
        }
        return option.description;
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
                <Header title={accountMode ? 'Payment Methods' : 'Choose Payment Methods'} />
                <View className="flex-1 items-center justify-center">
                    <Text className="text-sm font-montserrat text-gray">Loading payment methods...</Text>
                </View>
            </SafeAreaView>
        );
    }

    if (loadError) {
        return (
            <SafeAreaView className="flex-1 bg-app-bg" edges={['top']}>
                <Header title={accountMode ? 'Payment Methods' : 'Choose Payment Methods'} />
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
                <Header title={accountMode ? 'Payment Methods' : 'Choose Payment Methods'} />
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
            <Header title={accountMode ? 'Payment Methods' : 'Choose Payment Methods'} />

            <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
                {paymentOptions.map((item) => {
                    const selected = item.id === selectedPaymentId;
                    const disabled = isWalletOptionDisabled(item);
                    return (
                        <TouchableOpacity
                            key={item.id}
                            activeOpacity={disabled ? 1 : 0.85}
                            disabled={disabled}
                            onPress={() => setSelectedPaymentId(item.id)}
                            style={mergeSurfaceCardStyle()}
                            className={`px-4 py-5 mb-4 flex-row items-center ${SURFACE_CARD_CLASS} ${
                                selected ? 'border-2 border-brand' : ''
                            } ${disabled ? 'opacity-50' : ''}`}
                        >
                            <View className="w-14 h-14 rounded-full bg-white border border-border-color items-center justify-center mr-4 overflow-hidden">
                                {item.logo ? (
                                    <Image source={{ uri: item.logo }} className="w-11 h-11" resizeMode="contain" />
                                ) : (
                                    <Icon name={paymentIconName(item)} size={24} color="#6B7280" />
                                )}
                            </View>
                            <View className="flex-1">
                                <Text className="text-[17px] font-montserrat-bold text-dark-gray">
                                    {item.name}
                                </Text>
                                {getOptionDescription(item) ? (
                                    <Text className="text-xs font-montserrat text-gray mt-1">
                                        {getOptionDescription(item)}
                                    </Text>
                                ) : null}
                            </View>
                            {selected ? <Icon name="checkmark" size={24} color={BRAND} /> : null}
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>

            <StickyBottomBar>
                <Button
                    label={accountMode ? 'Done' : 'OK'}
                    onPress={handleConfirm}
                    disabled={isLoading || !selectedPayment}
                    size="md"
                    shape="pill"
                />
            </StickyBottomBar>
        </SafeAreaView>
    );
};

export default ChoosePaymentMethodScreen;
