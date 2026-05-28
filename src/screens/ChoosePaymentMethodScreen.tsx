import React, { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CommonActions, useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { ROUTES } from '../utils';
import Header from '../components/Header';
import { useSelector } from 'react-redux';
import { RootState } from '../utils/types';
import AlertMsg from '../components/AlertMsg/AlertMsg';
import { fetchPaymentOptions, PaymentOption } from '../utils/checkoutOptions';

const BRAND = '#5B8E68';

const paymentIconName = (option: PaymentOption): string => {
    const key = `${option.id} ${option.name} ${option.backendMethod}`.toLowerCase();
    if (key.includes('paypal')) return 'logo-paypal';
    if (key.includes('cash')) return 'cash-outline';
    if (key.includes('bank')) return 'business-outline';
    return 'card-outline';
};

const ChoosePaymentMethodScreen = () => {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const token = useSelector((state: RootState) => state.authentication.data?.token);
    const [paymentOptions, setPaymentOptions] = useState<PaymentOption[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const sourceCheckoutRouteKey = route.params?.sourceCheckoutRouteKey as string | undefined;
    const initialPaymentId = route.params?.selectedPaymentId || 'cash';
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
        try {
            const options = await fetchPaymentOptions(token, { refresh: true });
            setPaymentOptions(options);
            setSelectedPaymentId((current) =>
                options.some((opt) => opt.id === current) ? current : options[0]?.id || 'cash',
            );
        } catch {
            AlertMsg.customError({
                title: 'Payment Methods',
                message: 'Unable to load payment methods. Please try again.',
            });
        } finally {
            setIsLoading(false);
        }
    }, [token]);

    useFocusEffect(
        React.useCallback(() => {
            loadPaymentOptions();
        }, [loadPaymentOptions]),
    );

    const handleConfirm = () => {
        if (!selectedPayment) {
            return;
        }

        const nextParams = {
            selectedPaymentId: selectedPayment.id,
            selectedPaymentLabel: selectedPayment.name,
            selectedBackendPaymentMethod: selectedPayment.backendMethod,
            selectedPaymentGatewayType: selectedPayment.gatewayType,
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

    if (!isLoading && paymentOptions.length === 0) {
        return (
            <SafeAreaView className="flex-1 bg-app-bg" edges={['top']}>
                <Header title="Choose Payment Methods" />
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
            <Header title="Choose Payment Methods" />

            <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
                {paymentOptions.map((item) => {
                    const selected = item.id === selectedPaymentId;
                    return (
                        <TouchableOpacity
                            key={item.id}
                            activeOpacity={0.85}
                            onPress={() => setSelectedPaymentId(item.id)}
                            className={`rounded-2xl px-4 py-5 mb-4 flex-row items-center ${
                                selected ? 'bg-white border-2 border-brand' : 'bg-white border border-border-color'
                            }`}
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
                                {item.description ? (
                                    <Text className="text-xs font-montserrat text-gray mt-1">
                                        {item.description}
                                    </Text>
                                ) : null}
                            </View>
                            {selected ? <Icon name="checkmark" size={24} color={BRAND} /> : null}
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>

            <View className="px-5 py-4 bg-app-bg">
                <TouchableOpacity
                    activeOpacity={0.9}
                    onPress={handleConfirm}
                    disabled={isLoading || !selectedPayment}
                    className={`w-full h-14 rounded-full items-center justify-center ${
                        isLoading || !selectedPayment ? 'bg-brand/50' : 'bg-brand'
                    }`}
                >
                    <Text className="text-white text-base font-montserrat-bold">OK</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

export default ChoosePaymentMethodScreen;
