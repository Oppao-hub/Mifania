import React, { useState } from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { getAuth } from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

import { ROUTES } from '../utils';
import { RootState } from '../utils/types';
import { getEmbeddedCustomer } from '../utils/apiResource';
import * as Types from '../app/actions';
import Header from '../components/Header';
import SurfaceCard from '../components/SurfaceCard';
import LogoutBottomSheet from '../components/LogoutBottomSheet';
import { SettingsList, SettingsMenuRow } from '../components/SettingsList';
import IMAGES from '../utils/image';
import { useTabBarBottomPadding } from '../utils/layout';
import { showComingSoon } from '../utils/userFeedback';
import type { MainNavigationProp } from '../types/navigation';

const AccountScreen = () => {
  const navigation = useNavigation<MainNavigationProp>();
  const dispatch = useDispatch();
  const [showLogoutSheet, setShowLogoutSheet] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const tabBarBottomPadding = useTabBarBottomPadding();

  const { data: authData } = useSelector((state: RootState) => state.authentication);
  const { data: customerFromSlice } = useSelector((state: RootState) => state.customer);

  const user = authData?.user;
  const customer = customerFromSlice || getEmbeddedCustomer(user?.customer);
  const displayName = customer
    ? `${customer.firstName} ${customer.lastName}`.trim()
    : user?.firstName && user?.lastName
      ? `${user.firstName} ${user.lastName}`.trim()
      : 'Mifania User';
  const displayEmail = user?.email || 'user@mifania.com';

  const performLogout = async () => {
    setIsLoggingOut(true);
    try {
      const authInstance = getAuth();
      if (authInstance.currentUser) {
        await authInstance.signOut();
      }

      try {
        await GoogleSignin.signOut();
      } catch {
        // Ignore if not a Google user or error
      }

      dispatch({ type: Types.USER_LOGOUT });
    } catch (error) {
      console.error('Logout failed:', error);
      dispatch({ type: Types.USER_LOGOUT });
    } finally {
      setIsLoggingOut(false);
      setShowLogoutSheet(false);
    }
  };

  const accountShortcuts = [
    { icon: 'location-outline', label: 'Manage Addresses', onPress: () => navigation.navigate(ROUTES.MANAGE_ADDRESSES) },
    { icon: 'document-text-outline', label: 'My Orders', onPress: () => navigation.navigate(ROUTES.ORDER) },
    { icon: 'wallet-outline', label: 'My Wallet', onPress: () => navigation.navigate(ROUTES.WALLET) },
    { icon: 'gift-outline', label: 'Rewards', onPress: () => navigation.navigate(ROUTES.REWARDS) },
    { icon: 'card-outline', label: 'Payment Methods', onPress: () => navigation.navigate(ROUTES.PAYMENT_METHODS) },
    {
      icon: 'shield-checkmark-outline',
      label: 'Account & Security',
      onPress: () => navigation.navigate(ROUTES.ACCOUNT_SECURITY),
    },
  ];

  const settingsItems = [
    { icon: 'person-outline', label: 'My Profile', onPress: () => navigation.navigate(ROUTES.PROFILE) },
    { icon: 'notifications-outline', label: 'Notifications', onPress: () => navigation.navigate(ROUTES.NOTIFICATION) },
    { icon: 'swap-vertical-outline', label: 'Linked Accounts', onPress: () => showComingSoon('Linked Accounts') },
    {
      icon: 'eye-outline',
      label: 'App Appearance',
      onPress: () => navigation.navigate(ROUTES.APP_APPEARANCE),
    },
  ];

  return (
    <SafeAreaView className="flex-1 bg-app-bg" edges={['top']}>
      <Header
        title="Account"
        leftVariant="logo"
        hideNotificationBell
        rightIcon="scan-outline"
        onRightPress={() => showComingSoon('Scanner')}
      />

      <ScrollView
        className="flex-1 px-6 pt-2"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: tabBarBottomPadding }}
      >
        <SurfaceCard className="flex-row items-center p-5 mb-4">
          <Image
            source={customer?.avatar ? { uri: customer.avatar } : IMAGES.DEFAULT_AVATAR}
            className="w-14 h-14 rounded-full bg-light-gray"
            resizeMode="cover"
          />
          <View className="flex-1 ml-4 mr-2">
            <Text className="text-base font-montserrat-bold text-dark-gray" numberOfLines={1}>
              {displayName}
            </Text>
            <Text className="text-xs font-montserrat text-gray mt-0.5" numberOfLines={1}>
              {displayEmail}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => showComingSoon('Profile QR')}
            activeOpacity={0.7}
            className="p-1"
          >
            <Icon name="qr-code-outline" size={22} color="#4B5563" />
          </TouchableOpacity>
        </SurfaceCard>

        <SettingsList className="mb-4">
          {accountShortcuts.map((item, index) => (
            <SettingsMenuRow
              key={item.label}
              icon={item.icon}
              label={item.label}
              onPress={item.onPress}
              isLast={index === accountShortcuts.length - 1}
            />
          ))}
        </SettingsList>

        <SettingsList>
          {settingsItems.map((item) => (
            <SettingsMenuRow
              key={item.label}
              icon={item.icon}
              label={item.label}
              onPress={item.onPress}
            />
          ))}
          <SettingsMenuRow
            icon="log-out-outline"
            label="Logout"
            isLogout
            showChevron={false}
            onPress={() => setShowLogoutSheet(true)}
            isLast
          />
        </SettingsList>
      </ScrollView>

      <LogoutBottomSheet
        visible={showLogoutSheet}
        onCancel={() => setShowLogoutSheet(false)}
        onConfirm={performLogout}
        isLoading={isLoggingOut}
      />
    </SafeAreaView>
  );
};

export default AccountScreen;
