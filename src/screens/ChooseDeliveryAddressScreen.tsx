import React, { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CommonActions, useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { ROUTES } from '../utils';
import Header from '../components/Header';
import { useSelector } from 'react-redux';
import { RootState } from '../utils/types';

const BRAND = '#5B8E68';

type AddressOption = {
    id: string;
    title: string;
    tag?: string;
    name?: string;
    phone: string;
    address: string;
};

const ChooseDeliveryAddressScreen = () => {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const customerData = useSelector((state: RootState) => state.customer.data);
    const authCustomer = useSelector((state: RootState) => state.authentication.data?.user?.customer as any);

    const firstName = customerData?.firstName || authCustomer?.firstName || '';
    const lastName = customerData?.lastName || authCustomer?.lastName || '';
    const customerName = `${firstName} ${lastName}`.trim() || 'Customer';
    const customerPhone = customerData?.contactNumber || '( no contact number )';
    const customerAddress = [
        customerData?.address || authCustomer?.address,
        customerData?.city || authCustomer?.city,
        customerData?.state || authCustomer?.state,
        customerData?.postalCode || authCustomer?.postalCode,
    ]
        .filter(Boolean)
        .join(', ');

    const ADDRESS_OPTIONS: AddressOption[] = [
        {
            id: 'home',
            title: 'Home',
            tag: 'Main Address',
            name: customerName,
            phone: customerPhone,
            address: customerAddress || 'Add your address in profile',
        },
    ];

    const sourceCheckoutRouteKey = route.params?.sourceCheckoutRouteKey as string | undefined;
    const initialAddressId = route.params?.selectedAddressId || ADDRESS_OPTIONS[0].id;
    const [selectedAddressId, setSelectedAddressId] = useState<string>(initialAddressId);

    const selectedAddress = useMemo(
        () => ADDRESS_OPTIONS.find((item) => item.id === selectedAddressId) ?? ADDRESS_OPTIONS[0],
        [selectedAddressId],
    );

    const handleConfirm = () => {
        const nextParams = {
            selectedAddress: selectedAddress.address,
            selectedAddressName: selectedAddress.name
                ? `${selectedAddress.title} (${selectedAddress.name})`
                : selectedAddress.title,
            selectedAddressId: selectedAddress.id,
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
            <Header title="Choose Delivery Address" />

            <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
                {ADDRESS_OPTIONS.map((item) => {
                    const selected = item.id === selectedAddressId;
                    return (
                        <TouchableOpacity
                            key={item.id}
                            activeOpacity={0.85}
                            onPress={() => setSelectedAddressId(item.id)}
                            className={`rounded-2xl px-4 py-4 mb-4 ${
                                selected ? 'bg-white border-2 border-brand' : 'bg-white border border-border-color'
                            }`}
                        >
                            <View className="flex-row items-center justify-between">
                                <View className="flex-row items-center">
                                    <Text className="text-[20px] font-montserrat-bold text-dark-gray mr-3">
                                        {item.title}
                                    </Text>
                                    {item.tag ? (
                                        <View className="px-3 py-1 rounded-lg border border-brand/40 bg-brand/10">
                                            <Text className="text-xs font-montserrat text-brand">{item.tag}</Text>
                                        </View>
                                    ) : null}
                                </View>
                                <Icon name="share-social-outline" size={20} color="#1F2937" />
                            </View>

                            <View className="h-px bg-border-color my-3" />

                            <View className="flex-row items-center justify-between">
                                <Text className="text-[17px] font-montserrat-bold text-dark-gray">
                                    {item.name || 'Customer'}
                                </Text>
                                <Text className="text-[15px] font-montserrat text-dark-gray">{item.phone}</Text>
                            </View>
                            <Text className="text-[15px] font-montserrat text-dark-gray mt-3">
                                {item.address}
                            </Text>

                            <View className="flex-row items-center justify-between mt-4">
                                <View className="flex-row items-center">
                                    <Icon name="location-outline" size={18} color="#6B7280" />
                                    <Text className="ml-2 text-[13px] font-montserrat text-gray">
                                        Pinpoint already
                                    </Text>
                                </View>
                                {selected ? (
                                    <Icon name="checkmark" size={24} color={BRAND} />
                                ) : null}
                            </View>
                        </TouchableOpacity>
                    );
                })}
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

export default ChooseDeliveryAddressScreen;
