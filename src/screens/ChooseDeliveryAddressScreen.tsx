import React, { useCallback, useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CommonActions, useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useDispatch, useSelector } from 'react-redux';
import { ROUTES } from '../utils';
import Header from '../components/Header';
import Button from '../components/Button';
import StickyBottomBar from '../components/StickyBottomBar';
import { mergeSurfaceCardStyle, SURFACE_CARD_CLASS } from '../utils/cardStyles';
import { RootState, CustomerAddress, Customer } from '../utils/types';
import * as Types from '../app/actions';
import { getEmbeddedCustomer } from '../utils/apiResource';
import {
    formatAddressLine,
    formatDisplayPhone,
    getAddressId,
    getAddressRecipientName,
} from '../utils/address';

type AddressOption = {
    id: string;
    title: string;
    tag?: string;
    name: string;
    phone: string;
    address: string;
    hasPinpoint: boolean;
    source: CustomerAddress | null;
};

const buildLegacyOption = (customerData: Customer | null, authCustomer: any): AddressOption | null => {
    const firstName = customerData?.firstName || authCustomer?.firstName || '';
    const lastName = customerData?.lastName || authCustomer?.lastName || '';
    const customerName = `${firstName} ${lastName}`.trim() || 'Customer';
    const customerPhone = customerData?.contactNumber || authCustomer?.contactNumber;
    const customerAddress = [
        customerData?.address || authCustomer?.address,
        customerData?.city || authCustomer?.city,
        customerData?.state || authCustomer?.state,
        customerData?.postalCode || authCustomer?.postalCode,
    ]
        .filter(Boolean)
        .join(', ');

    if (!customerAddress) return null;

    return {
        id: 'legacy-home',
        title: 'Home',
        tag: 'Main Address',
        name: customerName,
        phone: formatDisplayPhone(customerPhone),
        address: customerAddress,
        hasPinpoint: true,
        source: null,
    };
};

const ChooseDeliveryAddressScreen = () => {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const dispatch = useDispatch();
    const token = useSelector((state: RootState) => state.authentication.data?.token);
    const customerData = useSelector((state: RootState) => state.customer.data);
    const authCustomer = useSelector(
        (state: RootState) => state.authentication.data?.user?.customer as any,
    );
    const { items: savedAddresses, isLoading } = useSelector((state: RootState) => state.address);

    useFocusEffect(
        useCallback(() => {
            if (token) {
                dispatch({ type: Types.GET_ADDRESSES });
            }
        }, [dispatch, token]),
    );

    const ADDRESS_OPTIONS: AddressOption[] = useMemo(() => {
        if (savedAddresses.length > 0) {
            return savedAddresses.map((item) => ({
                id: getAddressId(item),
                title: item.label,
                tag: item.isDefault ? 'Main Address' : undefined,
                name: getAddressRecipientName(item),
                phone: formatDisplayPhone(item.contactNumber),
                address: formatAddressLine(item),
                hasPinpoint: Boolean(item.hasPinpoint),
                source: item,
            }));
        }

        const legacy = buildLegacyOption(customerData, authCustomer);
        return legacy ? [legacy] : [];
    }, [savedAddresses, customerData, authCustomer]);

    const sourceCheckoutRouteKey = route.params?.sourceCheckoutRouteKey as string | undefined;
    const defaultId =
        ADDRESS_OPTIONS.find((item) => item.tag === 'Main Address')?.id || ADDRESS_OPTIONS[0]?.id || '';
    const initialAddressId = route.params?.selectedAddressId || defaultId;
    const [selectedAddressId, setSelectedAddressId] = useState<string>(initialAddressId);

    const selectedAddress = useMemo(
        () => ADDRESS_OPTIONS.find((item) => item.id === selectedAddressId) ?? ADDRESS_OPTIONS[0],
        [ADDRESS_OPTIONS, selectedAddressId],
    );

    const handleConfirm = () => {
        if (!selectedAddress) {
            navigation.navigate(ROUTES.MANAGE_ADDRESSES as never);
            return;
        }

        const nextParams = {
            selectedAddress: selectedAddress.address,
            selectedAddressName: `${selectedAddress.title} (${selectedAddress.name})`,
            selectedAddressId: selectedAddress.id,
            selectedCustomerAddressIri: selectedAddress.source
                ? selectedAddress.source['@id'] || `/api/customer_addresses/${selectedAddress.source.id}`
                : undefined,
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

            {isLoading && ADDRESS_OPTIONS.length === 0 ? (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color="#52622E" />
                </View>
            ) : (
                <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
                    {ADDRESS_OPTIONS.length === 0 ? (
                        <View
                            className={`${SURFACE_CARD_CLASS} px-4 py-6 mb-4 items-center`}
                            style={mergeSurfaceCardStyle()}
                        >
                            <Text className="text-base font-montserrat-bold text-dark-gray">
                                No delivery address yet
                            </Text>
                            <Text className="text-sm font-montserrat text-gray text-center mt-2">
                                Add an address before checkout.
                            </Text>
                            <Button
                                label="Manage Addresses"
                                onPress={() => navigation.navigate(ROUTES.MANAGE_ADDRESSES as never)}
                                variant="outline"
                                size="sm"
                                shape="pill"
                                fullWidth={false}
                                className="mt-5 px-6"
                            />
                        </View>
                    ) : (
                        ADDRESS_OPTIONS.map((item) => {
                            const selected = item.id === selectedAddressId;
                            return (
                                <TouchableOpacity
                                    key={item.id}
                                    activeOpacity={0.85}
                                    onPress={() => setSelectedAddressId(item.id)}
                                    style={mergeSurfaceCardStyle()}
                                    className={`px-4 py-4 mb-4 ${SURFACE_CARD_CLASS} ${
                                        selected ? 'border-2 border-brand' : ''
                                    }`}
                                >
                                    <View className="flex-row items-center justify-between">
                                        <View className="flex-row items-center flex-1 pr-2">
                                            <Text className="text-[20px] font-montserrat-bold text-dark-gray mr-3">
                                                {item.title}
                                            </Text>
                                            {item.tag ? (
                                                <View className="px-3 py-1 rounded-lg border border-brand/40 bg-brand/10">
                                                    <Text className="text-xs font-montserrat text-brand">
                                                        {item.tag}
                                                    </Text>
                                                </View>
                                            ) : null}
                                        </View>
                                    </View>

                                    <View className="h-px bg-border-color my-3" />

                                    <View className="flex-row items-center justify-between">
                                        <Text className="text-[17px] font-montserrat-bold text-dark-gray flex-1 pr-2">
                                            {item.name}
                                        </Text>
                                        <Text className="text-[15px] font-montserrat text-dark-gray">
                                            {item.phone}
                                        </Text>
                                    </View>
                                    <Text className="text-[15px] font-montserrat text-dark-gray mt-3 leading-5">
                                        {item.address}
                                    </Text>

                                    <View className="flex-row items-center justify-between mt-4">
                                        <View className="flex-row items-center">
                                            <Icon name="location-outline" size={18} color="#6B7280" />
                                            <Text className="ml-2 text-[13px] font-montserrat text-gray">
                                                {item.hasPinpoint ? 'Pinpoint already' : 'Pinpoint not set'}
                                            </Text>
                                        </View>
                                        {selected ? (
                                            <Icon name="checkmark" size={24} color="#52622E" />
                                        ) : null}
                                    </View>
                                </TouchableOpacity>
                            );
                        })
                    )}
                </ScrollView>
            )}

            <StickyBottomBar>
                <Button label="OK" onPress={handleConfirm} size="md" shape="pill" />
            </StickyBottomBar>
        </SafeAreaView>
    );
};

export default ChooseDeliveryAddressScreen;
