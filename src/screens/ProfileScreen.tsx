import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import LoadingState from '../components/LoadingState';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, Customer } from '../utils/types';
import { getEmbeddedCustomer, getCustomerRefFromUser } from '../utils/apiResource';
import * as Types from '../app/actions';
import Header from '../components/Header';
import CustomModal from '../components/CustomModal';
import Button from '../components/Button';
import IMAGES from '../utils/image';

const ProfileScreen = () => {
  const dispatch = useDispatch();
  const lastSyncedCustomerKey = useRef<string | null>(null);

  const { data: authData } = useSelector((state: RootState) => state.authentication);
  const { data: customerFromSlice, isLoading: isCustomerLoading, isError: isCustomerError, error: customerError } = useSelector((state: RootState) => state.customer);
  
  const user = authData?.user;
  const token = authData?.token;
  const customerRef = getCustomerRefFromUser(user);
  const customer: Customer | null = customerFromSlice || getEmbeddedCustomer(user?.customer);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');

  
  const [isEditing, setIsEditing] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // 💡 TRACK IF WE ARE ACTUALLY PERFORMING AN UPDATE
  const [isUpdating, setIsUpdating] = useState(false);

  // Local state for feedback modal
  const [modalConfig, setModalConfig] = useState<{
    visible: boolean;
    title: string;
    message: string;
    type: 'default' | 'danger' | 'success';
    isLoading: boolean;
    iconName?: string;
  }>({
    visible: false,
    title: '',
    message: '',
    type: 'default',
    isLoading: false,
  });

  // Fetch customer data when not already loaded (handles IRI refs from API Platform)
  useEffect(() => {
    if (customerRef && token && !customerFromSlice && !isCustomerLoading && !isCustomerError) {
      dispatch({ 
        type: Types.GET_CUSTOMER, 
        payload: { id: customerRef, token } 
      });
      dispatch({
        type: Types.GET_WALLET,
        payload: { id: customerRef, token }
      });
    }
  }, [customerRef, token, customerFromSlice, isCustomerLoading, isCustomerError, dispatch]);

  const fetchProfile = useCallback(() => {
    if (!customerRef || !token) return;
    dispatch({
      type: Types.GET_CUSTOMER,
      payload: { id: customerRef, token },
    });
    dispatch({
      type: Types.GET_WALLET,
      payload: { id: customerRef, token },
    });
  }, [customerRef, token, dispatch]);

  const onRefresh = async () => {
    if (isEditing) return;
    setRefreshing(true);
    lastSyncedCustomerKey.current = null;
    fetchProfile();
    setTimeout(() => setRefreshing(false), 1000);
  };

  const resetFormFromCustomer = () => {
    if (user?.email) setEmail(user.email);

    if (customer) {
      setFirstName(customer.firstName || '');
      setLastName(customer.lastName || '');
      setPhone(customer.contactNumber || '');
      setAddress(customer.address || '');
      setCity(customer.city || '');
      setPostalCode(customer.postalCode || '');
    } else if (user) {
      setFirstName(user.firstName || '');
      setLastName(user.lastName || '');
    }
  };

  // Sync form when customer profile loads or updates from API
  useEffect(() => {
    if (isUpdating || isEditing) return;

    if (user?.email) setEmail(user.email);

    if (customer) {
      const syncKey = String(customer.id ?? customer['@id'] ?? '');
      if (syncKey && syncKey === lastSyncedCustomerKey.current) return;

      setFirstName(customer.firstName || '');
      setLastName(customer.lastName || '');
      setPhone(customer.contactNumber || '');
      setAddress(customer.address || '');
      setCity(customer.city || '');
      setPostalCode(customer.postalCode || '');
      lastSyncedCustomerKey.current = syncKey || 'loaded';
    } else if (user) {
      setFirstName(user.firstName || '');
      setLastName(user.lastName || '');
    }
  }, [customer, user, isUpdating, isEditing]);

  // Monitor loading/error states for feedback
  useEffect(() => {
    // 💡 Only show "Updating" or "Success" modals if isUpdating is TRUE
    if (isCustomerLoading && isUpdating) {
      setModalConfig({
        visible: true,
        title: 'Updating',
        message: 'Updating your profile...',
        type: 'default',
        isLoading: true,
      });
    } else if (isCustomerError && customerError && isUpdating) {
      setModalConfig({
        visible: true,
        title: 'Error',
        message: customerError,
        type: 'danger',
        isLoading: false,
        iconName: 'alert-circle-outline'
      });
      setIsUpdating(false); // Reset update state
    } else if (lastSyncedCustomerKey.current && !isCustomerLoading && !isCustomerError && isUpdating && modalConfig.isLoading) {
      setModalConfig({
        visible: true,
        title: 'Success',
        message: 'Your profile has been updated successfully.',
        type: 'success',
        isLoading: false,
        iconName: 'checkmark-circle-outline'
      });
      setIsUpdating(false);
      setIsEditing(false);
    }
  }, [isCustomerLoading, isCustomerError, customerError, isUpdating, modalConfig.isLoading]);

  const handleStartEditing = () => {
    if (!isEditing) setIsEditing(true);
  };

  const handleCancelEdit = () => {
    resetFormFromCustomer();
    setIsEditing(false);
  };

  const handleUpdateProfile = () => {
    if (!isEditing) return;
    if (customerRef && token) {
      setIsUpdating(true); // 💡 Start update flow
      dispatch({
        type: Types.UPDATE_CUSTOMER,
        payload: {
          id: customerRef,
          token,
          data: {
            firstName,
            lastName,
            contactNumber: phone,
            address,
            city,
            postalCode
          }
        }
      });
    }
  };

  const closeModal = () => setModalConfig({ ...modalConfig, visible: false });

  const fieldContainerClass = (editable: boolean) =>
    `flex-row items-center border border-border-color rounded-2xl px-4 h-16 shadow-sm ${
      editable ? 'bg-white' : 'bg-gray-100'
    }`;

  const fieldTextClass = (editable: boolean) =>
    `flex-1 font-montserrat-bold text-sm ${editable ? 'text-brand-dark' : 'text-gray-500'}`;

  if (isCustomerLoading && !customer && customerRef) {
    return (
      <SafeAreaView className="flex-1 bg-app-bg" edges={['top']}>
        <LoadingState message="Loading profile..." />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-app-bg" edges={['top']}>
      <Header title="Profile" hideNotificationBell />
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        {/* HEADER */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
          className="flex-1"
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#52622E']}
              tintColor="#52622E"
              enabled={!isEditing}
            />
          }
        >
          {/* AVATAR SECTION */}
          <View className="items-center mt-6 mb-8">
            <View className="relative w-48 h-48">
              <View className="w-48 h-48 rounded-full overflow-hidden bg-light-gray border-2 border-border-color">
                <Image
                  source={
                    customer?.avatar
                      ? { uri: customer.avatar }
                      : IMAGES.DEFAULT_AVATAR
                  }
                  className="w-full h-full"
                  resizeMode="cover"
                />
              </View>
              {!isEditing ? (
                <TouchableOpacity
                  onPress={handleStartEditing}
                  activeOpacity={0.85}
                  accessibilityLabel="Edit profile"
                  className="absolute bottom-0 right-0 w-11 h-11 rounded-full bg-brand items-center justify-center border-[3px] border-white shadow-md"
                >
                  <Icon name="pencil" size={18} color="#FFFFFF" />
                </TouchableOpacity>
              ) : null}
            </View>
            {isEditing ? (
              <Text className="text-xs font-montserrat text-gray mt-3">
                Tap Cancel below to stop editing
              </Text>
            ) : null}
          </View>

          {/* FORM FIELDS */}
          <View className="px-6">
            
            <View className="flex-row justify-between items-center mb-2 ml-1">
              <Text className="text-xs font-montserrat-bold text-dark-gray">Personal Information</Text>
              {isEditing ? (
                <Text className="text-xs font-montserrat-bold text-brand">Editing</Text>
              ) : null}
            </View>

            {/* First Name */}
            <View className="mb-5">
              <Text className="text-xs font-montserrat-medium text-gray-500 mb-2 ml-1">First Name</Text>
              <View className={fieldContainerClass(isEditing)}>
                <TextInput
                  value={firstName}
                  onChangeText={setFirstName}
                  editable={isEditing}
                  className={fieldTextClass(isEditing)}
                  placeholderTextColor="#9CA3AF"
                />
              </View>
            </View>

            {/* Last Name */}
            <View className="mb-5">
              <Text className="text-xs font-montserrat-medium text-gray-500 mb-2 ml-1">Last Name</Text>
              <View className={fieldContainerClass(isEditing)}>
                <TextInput
                  value={lastName}
                  onChangeText={setLastName}
                  editable={isEditing}
                  className={fieldTextClass(isEditing)}
                  placeholderTextColor="#9CA3AF"
                />
              </View>
            </View>

            {/* Email */}
            <View className="mb-5">
              <Text className="text-xs font-montserrat-medium text-gray-500 mb-2 ml-1">Email</Text>
              <View className="flex-row items-center bg-gray-100 border border-border-color rounded-2xl px-4 h-16 shadow-sm">
                <Icon name="mail-outline" size={20} color="#6A7282" />
                <TextInput
                  value={email}
                  editable={false}
                  className="flex-1 font-montserrat-bold text-gray-500 text-sm ml-3"
                  placeholderTextColor="#9CA3AF"
                />
              </View>
            </View>

            {/* Phone Number */}
            <View className="mb-5">
              <Text className="text-xs font-montserrat-medium text-gray-500 mb-2 ml-1">Phone Number</Text>
              <View className={fieldContainerClass(isEditing)}>
                <TextInput
                  value={phone}
                  onChangeText={setPhone}
                  editable={isEditing}
                  keyboardType="phone-pad"
                  className={`${fieldTextClass(isEditing)} ml-1`}
                  placeholderTextColor="#9CA3AF"
                  placeholder={isEditing ? 'e.g., 09171234567' : undefined}
                />
              </View>
            </View>

            {/* Address */}
            <View className="mb-5">
              <Text className="text-xs font-montserrat-medium text-gray-500 mb-2 ml-1">Address</Text>
              <View className={fieldContainerClass(isEditing)}>
                <TextInput
                  value={address}
                  onChangeText={setAddress}
                  editable={isEditing}
                  className={fieldTextClass(isEditing)}
                  placeholderTextColor="#9CA3AF"
                />
              </View>
            </View>

            {/* City */}
            <View className="mb-5">
              <Text className="text-xs font-montserrat-medium text-gray-500 mb-2 ml-1">City</Text>
              <View className={fieldContainerClass(isEditing)}>
                <TextInput
                  value={city}
                  onChangeText={setCity}
                  editable={isEditing}
                  className={fieldTextClass(isEditing)}
                  placeholderTextColor="#9CA3AF"
                />
              </View>
            </View>

            {/* Postal Code */}
            <View className="mb-5">
              <Text className="text-xs font-montserrat-medium text-gray-500 mb-2 ml-1">Postal Code</Text>
              <View className={fieldContainerClass(isEditing)}>
                <TextInput
                  value={postalCode}
                  onChangeText={setPostalCode}
                  editable={isEditing}
                  keyboardType="numeric"
                  className={fieldTextClass(isEditing)}
                  placeholderTextColor="#9CA3AF"
                  placeholder={isEditing ? 'e.g., 1000' : undefined}
                />
              </View>
            </View>

            {isEditing ? (
              <View className="mt-4 gap-3">
                <Button label="Save Profile" onPress={handleUpdateProfile} />
                <Button
                  label="Cancel"
                  onPress={handleCancelEdit}
                  variant="outline"
                  disabled={isUpdating}
                />
              </View>
            ) : null}

          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <CustomModal 
        visible={modalConfig.visible}
        onClose={closeModal}
        title={modalConfig.title}
        message={modalConfig.message}
        type={modalConfig.type}
        isLoading={modalConfig.isLoading}
        iconName={modalConfig.iconName}
        primaryButtonText={modalConfig.isLoading ? undefined : "Close"}
        onPrimaryAction={closeModal}
      />
    </SafeAreaView>
  );
};

export default ProfileScreen;
