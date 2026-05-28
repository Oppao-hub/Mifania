import React, { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CommonActions, useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { ROUTES } from '../utils';
import Header from '../components/Header';
import { useSelector } from 'react-redux';
import { RootState } from '../utils/types';
import AlertMsg from '../components/AlertMsg/AlertMsg';
import { DeliveryOption, fetchDeliveryOptions } from '../utils/checkoutOptions';
import { useFocusEffect } from '@react-navigation/native';

const BRAND = '#5B8E68';

const deliveryIconName = (option: DeliveryOption): string => {
    const key = `${option.id} ${option.name}`.toLowerCase();
    if (key.includes('pickup') || key.includes('store')) return 'storefront-outline';
    if (key.includes('grab')) return 'bicycle-outline';
    if (key.includes('philpost') || key.includes('post')) return 'mail-outline';
    if (key.includes('lbc')) return 'business-outline';
    return 'cube-outline';
};

const ChooseDeliveryScreen = () => {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const token = useSelector((state: RootState) => state.authentication.data?.token);
    const [deliveryOptions, setDeliveryOptions] = useState<DeliveryOption[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const sourceCheckoutRouteKey = route.params?.sourceCheckoutRouteKey as string | undefined;
    const initialDeliveryId = route.params?.selectedDeliveryId || 'jt-express';
    const [selectedDeliveryId, setSelectedDeliveryId] = useState<string>(initialDeliveryId);

    const selectedDelivery = useMemo(
        () => deliveryOptions.find((item) => item.id === selectedDeliveryId) ?? deliveryOptions[0],
        [selectedDeliveryId, deliveryOptions],
    );

    const loadDeliveryOptions = React.useCallback(async () => {
        if (!token) {
            setIsLoading(false);
            return;
        }
        setIsLoading(true);
        try {
            const options = await fetchDeliveryOptions(token, { refresh: true });
            setDeliveryOptions(options);
            setSelectedDeliveryId((current) =>
                options.some((opt) => opt.id === current) ? current : options[0]?.id || 'jt-express',
            );
        } catch {
            AlertMsg.customError({
                title: 'Delivery Options',
                message: 'Unable to load delivery options. Please try again.',
            });
        } finally {
            setIsLoading(false);
        }
    }, [token]);

    useFocusEffect(
        React.useCallback(() => {
            loadDeliveryOptions();
        }, [loadDeliveryOptions]),
    );

    const handleConfirm = () => {
        if (!selectedDelivery) {
            return;
        }

        const nextParams = {
            selectedDeliveryId: selectedDelivery.id,
            selectedDeliveryName: selectedDelivery.name,
            selectedDeliveryEstimate: selectedDelivery.estimate,
            selectedDeliveryFee: selectedDelivery.fee,
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

    if (!isLoading && deliveryOptions.length === 0) {
        return (
            <SafeAreaView className="flex-1 bg-app-bg" edges={['top']}>
                <Header title="Choose Delivery Options" />
                <View className="flex-1 items-center justify-center px-6">
                    <Text className="text-sm font-montserrat text-gray text-center">
                        No delivery options available right now.
                    </Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-app-bg" edges={['top']}>
            <Header title="Choose Delivery Options" />

            <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
                {deliveryOptions.map((item) => {
                    const selected = item.id === selectedDeliveryId;
                    return (
                        <TouchableOpacity
                            key={item.id}
                            activeOpacity={0.85}
                            onPress={() => setSelectedDeliveryId(item.id)}
                            className={`rounded-2xl px-4 py-4 mb-4 flex-row items-center ${
                                selected ? 'bg-white border-2 border-brand' : 'bg-white border border-border-color'
                            }`}
                        >
                            <View className="w-14 h-14 rounded-full bg-white border border-border-color items-center justify-center mr-4 overflow-hidden">
                                {item.logo ? (
                                    <Image source={{ uri: item.logo }} className="w-11 h-11" resizeMode="contain" />
                                ) : (
                                    <Icon name={deliveryIconName(item)} size={24} color="#6B7280" />
                                )}
                            </View>
                            <View className="flex-1">
                                <Text className="text-[17px] font-montserrat-bold text-dark-gray" numberOfLines={2}>
                                    {item.name}
                                </Text>
                                <Text className="text-[13px] font-montserrat text-gray mt-1">{item.estimate}</Text>
                                {item.description ? (
                                    <Text className="text-xs font-montserrat text-gray mt-1" numberOfLines={2}>
                                        {item.description}
                                    </Text>
                                ) : null}
                                <Text className="text-[18px] font-montserrat-bold text-brand mt-1">{item.fee}</Text>
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
                    disabled={isLoading || !selectedDelivery}
                    className={`w-full h-14 rounded-full items-center justify-center ${
                        isLoading || !selectedDelivery ? 'bg-brand/50' : 'bg-brand'
                    }`}
                >
                    <Text className="text-white text-base font-montserrat-bold">OK</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

export default ChooseDeliveryScreen;
