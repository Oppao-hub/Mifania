import { Image, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { IMG } from '../utils';
import React from 'react';

const HomeScreen = () => {
  const navigation = useNavigation();
  return (
    <View className="flex-1 justify-center items-center bg-[#ebd5d5]">
      <Image 
        source={IMG.LOGO}
        className="w-full h-10 mb-1"
        resizeMode='contain'
      />
      <Text className="text-md font-bold text-brand">Welcome to Mifania</Text>

      <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
        <View>
          <Text className="w-full text-md text-brandLight bg-white px-2 py-2 rounded-lg mt-2">GO TO PROFILE SCREEN</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Login')}>
        <View>
          <Text className="w-full text-md text-brandLight bg-white px-16 py-2 rounded-lg mt-2">Log In</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default HomeScreen;