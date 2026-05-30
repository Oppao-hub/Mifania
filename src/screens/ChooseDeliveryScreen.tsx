import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CommonActions, useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { ROUTES } from '../utils';
import Header from '../components/Header';
import SelectableOptionCard from '../components/SelectableOptionCard';
import { useSelector } from 'react-redux';
import { RootState } from '../utils/types';
import Button from '../components/Button';
import StickyBottomBar from '../components/StickyBottomBar';
import EmptyState from '../components/EmptyState';
import LoadingState from '../components/LoadingState';
import { DeliveryOption, fetchDeliveryOptions } from '../utils/checkoutOptions';
import { useFocusEffect } from '@react-navigation/native';

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
    const [loadError, setLoadError] = useState<string | null>(null);
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
        setLoadError(null);
        try {
            const options = await fetchDeliveryOptions(token, { refresh: true });
            setDeliveryOptions(options);
            setSelectedDeliveryId((current) =>
                options.some((opt) => opt.id === current) ? current : options[0]?.id || 'jt-express',
            );
        } catch {
            setLoadError('Unable to load delivery options. Please try again.');
            setDeliveryOptions([]);
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

    if (isLoading) {
        return (
            <SafeAreaView className="flex-1 bg-app-bg" edges={['top']}>
                <Header title="Choose Delivery Options" hideNotificationBell />
                <LoadingState message="Loading delivery options..." />
            </SafeAreaView>
        );
    }

    if (loadError) {
        return (
            <SafeAreaView className="flex-1 bg-app-bg" edges={['top']}>
                <Header title="Choose Delivery Options" hideNotificationBell />
                <EmptyState
                    iconName="cloud-off-outline"
                    title="Could not load delivery options"
                    description={loadError}
                    buttonText="Try again"
                    onButtonPress={loadDeliveryOptions}
                />
            </SafeAreaView>
        );
    }

    if (deliveryOptions.length === 0) {
        return (
            <SafeAreaView className="flex-1 bg-app-bg" edges={['top']}>
                <Header title="Choose Delivery Options" hideNotificationBell />
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
            <Header title="Choose Delivery Options" hideNotificationBell />

            <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
                {deliveryOptions.map((item) => {
                    const selected = item.id === selectedDeliveryId;
                    return (
                        <SelectableOptionCard
                            key={item.id}
                            selected={selected}
                            onPress={() => setSelectedDeliveryId(item.id)}
                            left={
                                <View className="w-14 h-14 rounded-full bg-white border border-border-color items-center justify-center overflow-hidden">
                                    {item.logo ? (
                                        <Image source={{ uri: item.logo }} className="w-11 h-11" resizeMode="contain" />
                                    ) : (
                                        <Icon name={deliveryIconName(item)} size={24} color="#6B7280" />
                                    )}
                                </View>
                            }
                            title={item.name}
                            description={[item.estimate, item.description].filter(Boolean).join(' · ')}
                            trailing={
                                <Text className="text-[18px] font-montserrat-bold text-brand">{item.fee}</Text>
                            }
                        />
                    );
                })}
            </ScrollView>

            <StickyBottomBar>
                <Button
                    label="OK"
                    onPress={handleConfirm}
                    disabled={isLoading || !selectedDelivery}
                    size="md"
                    shape="pill"
                />
            </StickyBottomBar>
        </SafeAreaView>
    );
};

export default ChooseDeliveryScreen;
