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
  ActivityIndicator,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../utils/types';
import * as Types from '../app/actions';
import Header from '../components/Header';

const ProfileScreen = () => {
  const dispatch = useDispatch();
  const isInitialized = useRef(false);

  const { data: authData } = useSelector((state: RootState) => state.authentication);
  const { data: customer, isLoading: isCustomerLoading, isError: isCustomerError, error: customerError } = useSelector((state: RootState) => state.customer);
  const { wallet } = useSelector((state: RootState) => state.loyalty);
  
  const user = authData?.user;
  const token = authData?.token;

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');

  // Fetch data on mount
  useEffect(() => {
    if (user?.customerId && token) {
      dispatch({ 
        type: Types.GET_CUSTOMER, 
        payload: { id: user.customerId, token } 
      });
      dispatch({
        type: Types.GET_WALLET,
        payload: { id: user.customerId, token }
      });
    }
  }, [user?.customerId, token, dispatch]);

  // Initialize form fields once when customer data arrives
  useEffect(() => {
    if (customer && !isInitialized.current) {
      setFirstName(customer.firstName || '');
      setLastName(customer.lastName || '');
      setEmail(user?.email || '');
      setPhone(customer.contactNumber || '');
      setAddress(customer.address || '');
      setCity(customer.city || '');
      isInitialized.current = true;
    } else if (user && !isInitialized.current) {
      setFirstName(user.firstName || '');
      setLastName(user.lastName || '');
      setEmail(user.email || '');
    }
  }, [customer, user]);

  // Handle errors
  useEffect(() => {
    if (isCustomerError && customerError) {
      Alert.alert("Error", customerError);
    }
  }, [isCustomerError, customerError]);

  const handleUpdateProfile = () => {
    if (user?.customerId && token) {
      dispatch({
        type: Types.UPDATE_CUSTOMER,
        payload: {
          id: user.customerId,
          token,
          data: {
            firstName,
            lastName,
            contactNumber: phone,
            address,
            city
          }
        }
      });
      Alert.alert("Profile", "Updating your profile...");
    }
  };

  if (isCustomerLoading && !customer) {
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
                source={{ uri: customer?.avatar || 'https://randomuser.me/api/portraits/men/44.jpg' }} 
                className="w-32 h-32 rounded-full bg-light-gray"
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

            <TouchableOpacity 
              onPress={handleUpdateProfile}
              className="bg-brand h-16 rounded-2xl items-center justify-center mt-4 shadow-md"
            >
              <Text className="text-white font-montserrat-bold text-lg">Save Profile</Text>
            </TouchableOpacity>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ProfileScreen;