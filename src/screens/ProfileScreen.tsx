import React from 'react';
import { View, Text, Alert, Image, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import IMG from '../utils/image';

import { useDispatch, useSelector } from 'react-redux';
import { loginReset } from '../app/reducers/auth';
import { RootState } from '../types';

const ProfileScreen = () => {

  const dispatch = useDispatch();

  const { data } = useSelector((state: RootState) => state.authentication);

  const handleEdit = () => {
    Alert.alert("Edit Profile", "This feature is coming soon!");
  };

  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Logout", 
          style: "destructive",
          onPress: () => dispatch(loginReset()) 
        },
      ]
    );
  };

 const displayName = data?.user?.first_name ? `${data.user.first_name} ${data.user.last_name || ''}` : 'Fashion Enthusiast';
  const displayEmail = data?.user?.email || 'mifania.user@email.com';

  return (
    <SafeAreaView className="flex-1 bg-black" edges={['top']}>
      <View className="flex-1 items-center pt-16 px-6">
        <Image
          source={IMG.LOGO}
          className="w-32 h-32 rounded-full mb-5"
          resizeMode="contain"
        />

        <Text className="text-white text-2xl font-bold mb-1">{displayName}</Text>
        <Text className="text-gray-400 text-sm mb-8">{displayEmail}</Text>

        <TouchableOpacity
          className="w-full h-14 rounded-xl bg-indigo-600 justify-center items-center mb-4 shadow-lg"
          onPress={handleEdit}
        >
          <Text className="text-white font-bold text-lg">Edit Profile</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="w-full h-14 rounded-xl bg-zinc-900 justify-center items-center border border-zinc-800"
          onPress={handleLogout}
        >
          <Text className="text-red-500 font-bold text-lg">Logout</Text>
        </TouchableOpacity>
      </View> 
    </SafeAreaView>
  );
};

export default ProfileScreen;