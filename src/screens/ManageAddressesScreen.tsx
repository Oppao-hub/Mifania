import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    Share,
} from 'react-native';
import type { MenuAnchor } from '../components/AddressOptionsMenu';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import Header from '../components/Header';
import SurfaceCard from '../components/SurfaceCard';
import AddressOptionsMenu from '../components/AddressOptionsMenu';
import Button from '../components/Button';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';
import LoadingState from '../components/LoadingState';
import ConfirmationBottomSheet from '../components/ConfirmationBottomSheet';
import { ROUTES } from '../utils';
import { RootState, CustomerAddress } from '../utils/types';
import * as Types from '../app/actions';
import {
    formatAddressLine,
    formatDisplayPhone,
    getAddressId,
    getAddressRecipientName,
} from '../utils/address';
import { showBlockingError } from '../utils/userFeedback';

const ManageAddressesScreen = () => {
    const navigation = useNavigation<any>();
    const dispatch = useDispatch();
    const token = useSelector((state: RootState) => state.authentication.data?.token);
    const { items: addresses, isLoading, isError, error } = useSelector((state: RootState) => state.address);

    const [menuAddress, setMenuAddress] = useState<CustomerAddress | null>(null);
    const [menuAnchor, setMenuAnchor] = useState<MenuAnchor | null>(null);
    const [addressToDelete, setAddressToDelete] = useState<CustomerAddress | null>(null);
    const menuButtonRefs = useRef<Record<string, View | null>>({});
    const pendingDeleteRef = useRef(false);

    const closeMenu = () => {
        setMenuAddress(null);
        setMenuAnchor(null);
    };

    const openMenu = (address: CustomerAddress) => {
        const key = getAddressId(address);
        const node = menuButtonRefs.current[key];
        if (!node) return;

        node.measureInWindow((x, y, width, height) => {
            setMenuAnchor({ x, y, width, height });
            setMenuAddress(address);
        });
    };

    useFocusEffect(
        useCallback(() => {
            if (token) {
                dispatch({ type: Types.GET_ADDRESSES });
            }
        }, [dispatch, token]),
    );

    const handleAddAddress = () => {
        navigation.navigate(ROUTES.EDIT_ADDRESS as never);
    };

    const handleEditAddress = (address: CustomerAddress) => {
        navigation.navigate(ROUTES.EDIT_ADDRESS as never, { address });
    };

    const handleSetMain = (address: CustomerAddress) => {
        const id = getAddressId(address);
        if (!id) return;
        dispatch({
            type: Types.UPDATE_ADDRESS,
            payload: { id, data: { isDefault: true } },
        });
    };

    const handleDelete = (address: CustomerAddress) => {
        closeMenu();
        setAddressToDelete(address);
    };

    const handleConfirmDelete = () => {
        const id = getAddressId(addressToDelete!);
        if (!id) return;

        pendingDeleteRef.current = true;
        dispatch({ type: Types.DELETE_ADDRESS, payload: { id } });
    };

    const handleDismissDeleteSheet = () => {
        if (isLoading && pendingDeleteRef.current) return;
        pendingDeleteRef.current = false;
        setAddressToDelete(null);
    };

    useEffect(() => {
        if (!pendingDeleteRef.current || isLoading) return;

        if (isError) {
            showBlockingError({
                title: 'Delete failed',
                message: error || 'Could not delete this address. Please try again.',
            });
        }

        pendingDeleteRef.current = false;
        setAddressToDelete(null);
    }, [isLoading, isError, error]);

    const handleShare = async (address: CustomerAddress) => {
        const message = [
            getAddressRecipientName(address),
            formatDisplayPhone(address.contactNumber),
            formatAddressLine(address),
        ].join('\n');

        try {
            await Share.share({ message });
        } catch {
            // User dismissed share sheet
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-app-bg" edges={['top']}>
            <Header
                title="Manage Addresses"
                hideNotificationBell
                rightIcon="add"
                onRightPress={handleAddAddress}
            />

            <AddressOptionsMenu
                visible={menuAddress !== null}
                anchor={menuAnchor}
                onClose={closeMenu}
                showSetPrimary={!menuAddress?.isDefault}
                onSetPrimary={() => menuAddress && handleSetMain(menuAddress)}
                onDelete={() => menuAddress && handleDelete(menuAddress)}
            />

            {isLoading && addresses.length === 0 ? (
                <LoadingState message="Loading addresses..." />
            ) : isError && addresses.length === 0 ? (
                <ErrorState
                    error={error}
                    context="addresses"
                    onRetry={() => token && dispatch({ type: Types.GET_ADDRESSES })}
                />
            ) : (
                <ScrollView
                    className="flex-1 px-5 pt-1"
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 32 }}
                >
                    {addresses.length === 0 ? (
                        <SurfaceCard className="px-5 py-8 items-center">
                            <Icon name="location-outline" size={40} color="#9CA3AF" />
                            <Text className="text-base font-montserrat-bold text-dark-gray mt-4">
                                No saved addresses yet
                            </Text>
                            <Text className="text-sm font-montserrat text-gray text-center mt-2">
                                Tap the plus button to add your first delivery address.
                            </Text>
                            <Button
                                label="Add Address"
                                onPress={handleAddAddress}
                                variant="outline"
                                size="sm"
                                shape="pill"
                                fullWidth={false}
                                className="mt-6 px-8"
                            />
                        </SurfaceCard>
                    ) : (
                        addresses.map((item) => (
                            <SurfaceCard
                                key={getAddressId(item) || item.label}
                                className="px-4 py-4 mb-4"
                            >
                                <View className="flex-row items-start justify-between">
                                    <View className="flex-row items-center flex-1 flex-wrap pr-2">
                                        <Text className="text-[20px] font-montserrat-bold text-dark-gray mr-2">
                                            {item.label}
                                        </Text>
                                        {item.isDefault ? (
                                            <View className="px-3 py-1 rounded-full border border-brand">
                                                <Text className="text-[11px] font-montserrat-medium text-brand">
                                                    Main Address
                                                </Text>
                                            </View>
                                        ) : null}
                                    </View>
                                    <TouchableOpacity
                                        onPress={() => handleShare(item)}
                                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                                    >
                                        <Icon name="share-social-outline" size={20} color="#1F2937" />
                                    </TouchableOpacity>
                                </View>

                                <View className="flex-row items-center justify-between mt-3">
                                    <Text
                                        className="text-[17px] font-montserrat-bold text-dark-gray flex-shrink"
                                        numberOfLines={1}
                                    >
                                        {getAddressRecipientName(item)}
                                    </Text>
                                    <Text className="text-[14px] font-montserrat text-dark-gray ml-2">
                                        {formatDisplayPhone(item.contactNumber)}
                                    </Text>
                                </View>

                                <Text className="text-[15px] font-montserrat text-dark-gray mt-2 leading-5">
                                    {formatAddressLine(item)}
                                </Text>

                                <View className="flex-row items-center mt-3">
                                    <Icon name="location-outline" size={16} color="#6A7282" />
                                    <Text className="ml-1.5 text-[13px] font-montserrat text-gray">
                                        {item.hasPinpoint ? 'Pinpoint already' : 'Pinpoint not set'}
                                    </Text>
                                </View>

                                <View className="flex-row items-center mt-4 gap-3">
                                    <TouchableOpacity
                                        activeOpacity={0.85}
                                        onPress={() => handleEditAddress(item)}
                                        className="flex-1 h-[46px] rounded-full border border-brand items-center justify-center"
                                    >
                                        <Text className="text-brand font-montserrat-bold text-[15px]">
                                            Change Address
                                        </Text>
                                    </TouchableOpacity>

                                    {!item.isDefault ? (
                                        <View
                                            ref={(el) => {
                                                menuButtonRefs.current[getAddressId(item)] = el;
                                            }}
                                            collapsable={false}
                                        >
                                            <TouchableOpacity
                                                activeOpacity={0.85}
                                                onPress={() => openMenu(item)}
                                                className="w-[46px] h-[46px] rounded-full border border-brand items-center justify-center"
                                            >
                                                <Icon
                                                    name="ellipsis-vertical"
                                                    size={18}
                                                    color="#52622E"
                                                />
                                            </TouchableOpacity>
                                        </View>
                                    ) : null}
                                </View>
                            </SurfaceCard>
                        ))
                    )}
                </ScrollView>
            )}

            <ConfirmationBottomSheet
                visible={addressToDelete !== null}
                title="Delete Address"
                titleTone="danger"
                message={
                    addressToDelete
                        ? `Remove "${addressToDelete.label}" from your saved addresses?`
                        : ''
                }
                cancelLabel="Cancel"
                confirmLabel="Delete"
                confirmVariant="danger"
                onCancel={handleDismissDeleteSheet}
                onConfirm={handleConfirmDelete}
                isLoading={isLoading && pendingDeleteRef.current}
            />
        </SafeAreaView>
    );
};

export default ManageAddressesScreen;
