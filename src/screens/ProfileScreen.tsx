import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  Image, 
  TouchableOpacity, 
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, Customer } from '../utils/types';
import { getEmbeddedCustomer, getCustomerRefFromUser } from '../utils/apiResource';
import * as Types from '../app/actions';
import Header from '../components/Header';
import CustomModal from '../components/CustomModal';
import IMAGES from '../utils/image';

const ProfileScreen = () => {
  const dispatch = useDispatch();
  const lastSyncedCustomerKey = useRef<string | null>(null);

  const { data: authData } = useSelector((state: RootState) => state.authentication);
  const { data: customerFromSlice, isLoading: isCustomerLoading, isError: isCustomerError, error: customerError } = useSelector((state: RootState) => state.customer);
  const { wallet } = useSelector((state: RootState) => state.wallet);
  
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

  // Sync form when customer profile loads or updates from API
  useEffect(() => {
    if (isUpdating) return;

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
  }, [customer, user, isUpdating]);

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
      setIsUpdating(false); // Reset update state
    }
  }, [isCustomerLoading, isCustomerError, customerError, isUpdating, modalConfig.isLoading]);

  const handleUpdateProfile = () => {
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

  if (isCustomerLoading && !customer && customerRef) {
    return (
      <View className="flex-1 justify-center items-center bg-app-bg">
        <ActivityIndicator size="large" color="#52622E" />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-app-bg" edges={['top']}>
      <Header title="Profile"/>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        {/* HEADER */}
        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
          className="flex-1"
        >
          {/* WALLET & REWARDS SECTION */}
          <View className="flex-row px-6 mt-4 justify-between">
            <View className="bg-white p-4 rounded-2xl flex-1 mr-2 shadow-sm border border-border-color">
              <Text className="text-xs font-montserrat-medium text-gray-500 mb-1">Wallet Balance</Text>
              <Text className="text-lg font-montserrat-bold text-brand">₱{wallet?.balance || '0.00'}</Text>
            </View>
            <View className="bg-white p-4 rounded-2xl flex-1 ml-2 shadow-sm border border-border-color">
              <Text className="text-xs font-montserrat-medium text-gray-500 mb-1">Reward Points</Text>
              <Text className="text-lg font-montserrat-bold text-terracotta">{wallet?.rewardPoints || 0} pts</Text>
            </View>
          </View>

          {/* AVATAR SECTION */}
          <View className="items-center mt-6 mb-8">
            <View className="relative">
              <Image 
                source={
                  customer?.avatar 
                    ? { uri: customer.avatar }
                    : IMAGES.DEFAULT_AVATAR
                } 
                className="w-48 h-48 rounded-md bg-light-gray"
                resizeMode="cover"
              />  
              <TouchableOpacity 
                activeOpacity={0.8}
                className="absolute bottom-1 right-1 bg-brand w-8 h-8 rounded-lg items-center justify-center border-2 border-white shadow-sm"
              >
                <Icon name="pencil" size={16} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>

          {/* FORM FIELDS */}
          <View className="px-6">
            
            <View className="flex-row justify-between items-center mb-2 ml-1">
              <Text className="text-xs font-montserrat-bold text-dark-gray">Personal Information</Text>
            </View>

            {/* First Name */}
            <View className="mb-5">
              <Text className="text-xs font-montserrat-medium text-gray-500 mb-2 ml-1">First Name</Text>
              <View className="flex-row items-center bg-white border border-border-color rounded-2xl px-4 h-16 shadow-sm focus:border-brand">
                <TextInput 
                  value={firstName}
                  onChangeText={setFirstName}
                  className="flex-1 font-montserrat-bold text-brand-dark text-sm"
                  placeholderTextColor="#9CA3AF"
                />
              </View>
            </View>

            {/* Last Name */}
            <View className="mb-5">
              <Text className="text-xs font-montserrat-medium text-gray-500 mb-2 ml-1">Last Name</Text>
              <View className="flex-row items-center bg-white border border-border-color rounded-2xl px-4 h-16 shadow-sm">
                <TextInput 
                  value={lastName}
                  onChangeText={setLastName}
                  className="flex-1 font-montserrat-bold text-brand-dark text-sm"
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
              <View className="flex-row items-center bg-white border border-border-color rounded-2xl px-4 h-16 shadow-sm">
                <TextInput 
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                  className="flex-1 font-montserrat-bold text-brand-dark text-sm ml-1"
                  placeholderTextColor="#9CA3AF"
                  placeholder="e.g., 09171234567"
                />
              </View>
            </View>

            {/* Address */}
            <View className="mb-5">
              <Text className="text-xs font-montserrat-medium text-gray-500 mb-2 ml-1">Address</Text>
              <View className="flex-row items-center bg-white border border-border-color rounded-2xl px-4 h-16 shadow-sm">
                <TextInput 
                  value={address}
                  onChangeText={setAddress}
                  className="flex-1 font-montserrat-bold text-brand-dark text-sm"
                  placeholderTextColor="#9CA3AF"
                />
              </View>
            </View>

            {/* City */}
            <View className="mb-5">
              <Text className="text-xs font-montserrat-medium text-gray-500 mb-2 ml-1">City</Text>
              <View className="flex-row items-center bg-white border border-border-color rounded-2xl px-4 h-16 shadow-sm">
                <TextInput 
                  value={city}
                  onChangeText={setCity}
                  className="flex-1 font-montserrat-bold text-brand-dark text-sm"
                  placeholderTextColor="#9CA3AF"
                />
              </View>
            </View>

            {/* Postal Code */}
            <View className="mb-5">
              <Text className="text-xs font-montserrat-medium text-gray-500 mb-2 ml-1">Postal Code</Text>
              <View className="flex-row items-center bg-white border border-border-color rounded-2xl px-4 h-16 shadow-sm">
                <TextInput 
                  value={postalCode}
                  onChangeText={setPostalCode}
                  keyboardType="numeric"
                  className="flex-1 font-montserrat-bold text-brand-dark text-sm"
                  placeholderTextColor="#9CA3AF"
                  placeholder="e.g., 1000"
                />
              </View>
            </View>

            <TouchableOpacity 
              onPress={handleUpdateProfile}
              className="bg-brand h-16 rounded-2xl items-center justify-center mt-4 shadow-md"
            >
              <Text className="text-white font-montserrat-bold text-lg">Save Profile</Text>
            </TouchableOpacity>

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
