import React from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { getAuth } from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

import { ROUTES } from '../utils';
import { RootState } from '../utils/types';
import * as Types from '../app/actions';
import Header from '../components/Header';

// Reusable component for the list items
interface ProfileOptionItemProps {
  icon: string;
  label: string;
  isLogout?: boolean;
  onPress?: () => void;
}

const ProfileOptionItem: React.FC<ProfileOptionItemProps> = ({ icon, label, isLogout, onPress }) => (
  <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
    <View className="flex-row items-center justify-between py-4">
      <View className="flex-row items-center flex-1">
        <Icon name={icon} size={22} color={isLogout ? '#DC3545' : '#4B5563'} style={{ marginRight: 16 }} />
        <Text className={`text-base font-montserrat-bold ${isLogout ? 'text-danger' : 'text-dark-gray'} flex-1`}>
          {label}
        </Text>
      </View>
      <Icon name="chevron-forward" size={20} color={isLogout ? '#DC3545' : '#9CA3AF'} />
    </View>
  </TouchableOpacity>
);

const AccountScreen = () => {
  const navigation = useNavigation<any>();
  const dispatch = useDispatch();
  
  const { data: authData } = useSelector((state: RootState) => state.authentication);
  const { data: customer } = useSelector((state: RootState) => state.customer);
  
  const user = authData?.user;
  const displayName = customer ? `${customer.firstName} ${customer.lastName}` : 'Mifania User';
  const displayEmail = user?.email || 'user@mifania.com';
  const displayAvatar = customer?.avatar || 'https://randomuser.me/api/portraits/men/32.jpg';

  const handleEditProfile = () => {
    navigation.navigate(ROUTES.PROFILE as never);
  };

  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to log out?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Logout", 
          style: "destructive", 
          onPress: async () => {
            try {
              // Step 1: Sign out from Firebase
              const authInstance = getAuth();
              if (authInstance.currentUser) {
                await authInstance.signOut();
              }

              // Step 2: Sign out from Google to avoid "auto-login" loop
              try {
                await GoogleSignin.signOut();
              } catch {
                // Ignore if not a Google user or error
              }

              // Step 3: Clear Redux state
              dispatch({ type: Types.USER_LOGOUT });
              
              console.log("✅ Successfully logged out from all providers");
              // AppNavigator will automatically switch to Auth stack because token is cleared
            } catch (error) {
              console.error("❌ Logout failed:", error);
              // Fallback: Clear Redux anyway so UI resets
              dispatch({ type: Types.USER_LOGOUT });
            }
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-app-bg" edges={['top']}>
      {/* HEADER */}
      <Header title="Account"/>
      <ScrollView 
        className="flex-1 px-6 pt-2"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* PROFILE CARD */}
        <View className="flex-row items-center bg-white rounded-3xl p-5 mb-8 shadow-sm">
          <Image 
            source={{ uri: displayAvatar }} 
            className="w-16 h-16 rounded-full bg-light-gray"
            resizeMode="cover"
          />
          <View className="flex-1 ml-4">
            <Text className="text-lg font-montserrat-bold text-dark-gray mb-0.5">{displayName}</Text>
            <Text className="text-xs text-gray font-montserrat">{displayEmail}</Text>
          </View>
          <TouchableOpacity onPress={handleEditProfile} className="ml-2">
            <Icon name="create-outline" size={24} color="#52622E" />
          </TouchableOpacity>
        </View>

        {/* LIST OPTIONS - GROUP 1 */}
        <View className="bg-white rounded-3xl px-5 mb-6 shadow-sm">
          <ProfileOptionItem icon="location-outline" label="Manage Addresses" />
          <View className="h-[1px] bg-light-gray" />
          <ProfileOptionItem icon="card-outline" label="Payment Methods" />
          <View className="h-[1px] bg-light-gray" />
          <ProfileOptionItem icon="shield-checkmark-outline" label="Account & Security" />
        </View>

        {/* LIST OPTIONS - GROUP 2 */}
        <View className="bg-white rounded-3xl px-5 mb-6 shadow-sm">
          <ProfileOptionItem icon="person-outline" label="My Profile" onPress={handleEditProfile} />
          <View className="h-[1px] bg-light-gray" />
          <ProfileOptionItem icon="document-text-outline" label="My Orders" onPress={() => navigation.navigate(ROUTES.ORDER as never)} />
          <View className="h-[1px] bg-light-gray" />
          <ProfileOptionItem icon="notifications-outline" label="Notifications" />
          <View className="h-[1px] bg-light-gray" />
          <ProfileOptionItem icon="repeat-outline" label="Linked Accounts" />
          <View className="h-[1px] bg-light-gray" />
          <ProfileOptionItem icon="eye-outline" label="App Appearance" />
          <View className="h-[1px] bg-light-gray" />
          <ProfileOptionItem icon="document-text-outline" label="Help & Support" />
        </View>

        {/* LIST OPTIONS - LOGOUT */}
        <View className="bg-white rounded-3xl px-5 shadow-sm">
          <ProfileOptionItem 
            icon="log-out-outline" 
            label="Logout" 
            isLogout 
            onPress={handleLogout}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default AccountScreen;
