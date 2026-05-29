import React, { useEffect, useMemo, useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { RootState, CustomerAddress } from '../utils/types';
import * as Types from '../app/actions';
import { formatAddressLine, getAddressId } from '../utils/address';
import { getEmbeddedCustomer } from '../utils/apiResource';

const splitRecipientName = (fullName: string): { first: string; last: string } => {
    const trimmed = fullName.trim();
    if (!trimmed) return { first: '', last: '' };
    const spaceIndex = trimmed.indexOf(' ');
    if (spaceIndex === -1) return { first: trimmed, last: '' };
    return {
        first: trimmed.slice(0, spaceIndex),
        last: trimmed.slice(spaceIndex + 1).trim(),
    };
};

const EditAddressScreen = () => {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const dispatch = useDispatch();
    const existingAddress = route.params?.address as CustomerAddress | undefined;
    const isEditing = Boolean(existingAddress);

    const token = useSelector((state: RootState) => state.authentication.data?.token);
    const customer = useSelector((state: RootState) => state.customer.data);
    const authCustomer = useSelector(
        (state: RootState) => state.authentication.data?.user?.customer,
    );
    const profile = customer || getEmbeddedCustomer(authCustomer);
    const { isLoading } = useSelector((state: RootState) => state.address);

    const [label, setLabel] = useState('');
    const [courierNote, setCourierNote] = useState('');
    const [recipientName, setRecipientName] = useState('');
    const [contactNumber, setContactNumber] = useState('');
    const [address, setAddress] = useState('');
    const [city, setCity] = useState('');
    const [stateName, setStateName] = useState('');
    const [postalCode, setPostalCode] = useState('');
    const [country, setCountry] = useState('Philippines');
    const [isDefault, setIsDefault] = useState(false);
    const [hasPinpoint, setHasPinpoint] = useState(true);
    const [showLocationFields, setShowLocationFields] = useState(false);

    useEffect(() => {
        if (existingAddress) {
            setLabel(existingAddress.label || '');
            setCourierNote(existingAddress.courierNote || '');
            setRecipientName(
                existingAddress.recipientFullName ||
                    [existingAddress.recipientFirstName, existingAddress.recipientLastName]
                        .filter(Boolean)
                        .join(' '),
            );
            setContactNumber(existingAddress.contactNumber || '');
            setAddress(existingAddress.address || '');
            setCity(existingAddress.city || '');
            setStateName(existingAddress.state || '');
            setPostalCode(existingAddress.postalCode || '');
            setCountry(existingAddress.country || 'Philippines');
            setIsDefault(Boolean(existingAddress.isDefault));
            setHasPinpoint(Boolean(existingAddress.hasPinpoint));
            return;
        }

        setRecipientName(
            [profile?.firstName, profile?.lastName].filter(Boolean).join(' ') || '',
        );
        setContactNumber(profile?.contactNumber || '');
        setAddress(profile?.address || '');
        setCity(profile?.city || '');
        setStateName(profile?.state || '');
        setPostalCode(profile?.postalCode || '');
        setCountry(profile?.country || 'Philippines');
    }, [existingAddress, profile]);

    const locationPreview = useMemo(
        () =>
            formatAddressLine({
                address,
                city,
                state: stateName,
                postalCode,
                country,
            } as CustomerAddress),
        [address, city, stateName, postalCode, country],
    );

    const handleSave = () => {
        if (!token) return;

        const { first, last } = splitRecipientName(recipientName);
        const payload = {
            label: label.trim(),
            courierNote: courierNote.trim() || null,
            recipientFirstName: first,
            recipientLastName: last,
            contactNumber: contactNumber.trim(),
            address: address.trim(),
            city: city.trim(),
            state: stateName.trim(),
            postalCode: postalCode.trim(),
            country: country.trim(),
            isDefault,
            hasPinpoint: hasPinpoint || Boolean(address.trim()),
        };

        if (isEditing) {
            const id = getAddressId(existingAddress!);
            dispatch({ type: Types.UPDATE_ADDRESS, payload: { id, data: payload } });
        } else {
            dispatch({ type: Types.CREATE_ADDRESS, payload: { data: payload } });
        }

        navigation.goBack();
    };

    const renderField = (
        title: string,
        value: string,
        onChangeText: (text: string) => void,
        options?: {
            placeholder?: string;
            keyboardType?: 'default' | 'phone-pad';
            multiline?: boolean;
        },
    ) => (
        <View className="mb-5">
            <Text className="text-[15px] font-montserrat-bold text-dark-gray mb-2">{title}</Text>
            <View
                className={`bg-light-gray rounded-xl px-4 ${
                    options?.multiline ? 'py-3 min-h-[52px]' : 'h-[52px] justify-center'
                }`}
            >
                <TextInput
                    value={value}
                    onChangeText={onChangeText}
                    placeholder={options?.placeholder}
                    keyboardType={options?.keyboardType || 'default'}
                    multiline={options?.multiline}
                    textAlignVertical={options?.multiline ? 'top' : 'center'}
                    className="font-montserrat text-dark-gray text-[15px]"
                    placeholderTextColor="#9CA3AF"
                />
            </View>
        </View>
    );

    return (
        <SafeAreaView className="flex-1 bg-white" edges={['top', 'bottom']}>
            <View className="flex-row items-center justify-between px-4 h-14">
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    className="w-10 h-10 items-center justify-center"
                >
                    <Icon name="close" size={26} color="#4B5563" />
                </TouchableOpacity>
                <Text className="text-[18px] font-montserrat-bold text-dark-gray">
                    Address Details
                </Text>
                <View className="w-10" />
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                className="flex-1"
            >
                <ScrollView
                    className="flex-1 px-5"
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 24 }}
                >
                    <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() => setShowLocationFields((prev) => !prev)}
                        className="flex-row items-start mb-6"
                    >
                        <Icon name="location" size={22} color="#52622E" style={{ marginTop: 2 }} />
                        <Text className="flex-1 ml-2 text-[15px] font-montserrat text-dark-gray leading-5">
                            {locationPreview || 'Tap to add your delivery location'}
                        </Text>
                    </TouchableOpacity>

                    {showLocationFields ? (
                        <View className="mb-4">
                            {renderField('Street Address', address, setAddress, { multiline: true })}
                            {renderField('City', city, setCity)}
                            {renderField('State / Province', stateName, setStateName)}
                            {renderField('Postal Code', postalCode, setPostalCode)}
                            {renderField('Country', country, setCountry)}
                        </View>
                    ) : null}

                    {renderField('Address Labels', label, setLabel, { placeholder: 'e.g. Home, Work Office' })}
                    {renderField('Note to Courier (optional)', courierNote, setCourierNote, {
                        placeholder: 'Note',
                    })}
                    {renderField("Recipient's Name", recipientName, setRecipientName)}

                    <View className="mb-5">
                        <Text className="text-[15px] font-montserrat-bold text-dark-gray mb-2">
                            {"Recipient's Phone Number"}
                        </Text>
                        <View className="flex-row items-center bg-light-gray rounded-xl h-[52px] px-3">
                            <View className="flex-row items-center pr-3 border-r border-border-color mr-3">
                                <Text className="text-lg mr-1">🇵🇭</Text>
                                <Icon name="chevron-down" size={14} color="#6A7282" />
                            </View>
                            <TextInput
                                value={contactNumber}
                                onChangeText={setContactNumber}
                                keyboardType="phone-pad"
                                placeholder="09XXXXXXXXX"
                                className="flex-1 font-montserrat text-dark-gray text-[15px]"
                                placeholderTextColor="#9CA3AF"
                            />
                        </View>
                    </View>

                    <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() => setIsDefault((prev) => !prev)}
                        className="flex-row items-center mb-6"
                    >
                        <View
                            className={`w-6 h-6 rounded-md border-2 items-center justify-center mr-3 ${
                                isDefault ? 'bg-brand border-brand' : 'border-brand bg-white'
                            }`}
                        >
                            {isDefault ? <Icon name="checkmark" size={16} color="#FFFFFF" /> : null}
                        </View>
                        <Text className="text-[15px] font-montserrat-medium text-dark-gray">
                            Set As Primary Address
                        </Text>
                    </TouchableOpacity>
                </ScrollView>

                <View className="px-5 py-4 bg-white">
                    <TouchableOpacity
                        activeOpacity={0.9}
                        onPress={handleSave}
                        disabled={isLoading || !label.trim() || !address.trim()}
                        className={`w-full h-[52px] rounded-full items-center justify-center ${
                            isLoading || !label.trim() || !address.trim()
                                ? 'bg-brand/50'
                                : 'bg-brand'
                        }`}
                    >
                        {isLoading ? (
                            <ActivityIndicator color="#FFFFFF" />
                        ) : (
                            <Text className="text-white text-base font-montserrat-bold">Save</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default EditAddressScreen;
