import React, { useEffect, useState } from 'react';
import { View, Text, Alert, Image, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import IMG from '../utils/image';

const ProfileScreen = () => {
  const navigation = useNavigation();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const checkUser = async () => {
      if(!user){
        navigation.replace('Login');
      }else{
        setUser(JSON.parse(userData));
      }
    };
    checkUser();
  }, []);

  const handleEdit = () => {
    Alert.alert("Edit Profile", "This feature is coming soon!");
  };

  const handleLogout = async () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Logout", 
          onPress: async () => {
            navigation.replace('Login');
          },
        },
      ],
      { cancelable: true }
    );
  };

  if(!user) return null; // or a loading spinner

  return (
    <View className="flex-1 items-center pt-16 px-6 bg-black">
      <Image
        source={IMG.LOGO}
        className="w-30 h-30 rounded-full mb-5 resize-contain"
      />

      <Text className="text-white text-xl font-bold">{user.name || 'John Doe'}</Text>
      <Text className="text-gray-400 text-sm mb-8">{user.email || 'john.doe@email.com'}</Text>

      <TouchableOpacity
        className="w-full h-12 rounded-lg bg-indigo-600 justify-center items-center mb-3"
        onPress={handleEdit}
      >
        <Text className="text-white font-semibold">Edit Profile</Text>
      </TouchableOpacity>

      <TouchableOpacity
        className="w-full h-12 rounded-lg bg-gray-800 justify-center items-center"
        onPress={handleLogout}
      >
        <Text className="text-red-500 font-semibold">Logout</Text>
      </TouchableOpacity>
    </View> 
  );
};

export default ProfileScreen;