import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ImageBackground, Image, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IMG } from '../../utils';
import FormInput from '../../components/FormInput';
import PasswordInput from '../../components/PasswordInput';
import { useNavigation } from '@react-navigation/native';

import { useDispatch, useSelector } from 'react-redux';
import { userLogin } from '../../app/reducers/auth';

const LoginScreen = () => {
const [email, setEmail] = useState('');
const [password, setPassword] = useState('');
const navigation = useNavigation();
const dispatch = useDispatch();

const { isLoading, isError, error } = useSelector((state) => state.authentication);

useEffect(() => {
  if (isError && error && !isLoading) {
    Alert.alert("Login Failed", error);
  }
}, [isError, error, isLoading]);

const handleLogin = () => {
  if (!email.trim() || !password.trim()) {
    Alert.alert("Input Error", "Please enter your credentials.");
    return;
  }
  
  dispatch(
    userLogin({
      email: email,
      password: password,
    })
  );
};

return (
  <SafeAreaView className="flex-1 bg-white" edges={['top']}>
    <ImageBackground source={IMG.AUTH_BG} className="flex-1 justify-center items-center">
      <View className="w-full items-center">
        <View className="w-[90%] bg-white/50 rounded-[40px] p-8 items-center shadow-2xl">
          <Image className="w-full h-10 mb-6" source={IMG.LOGO} resizeMode='contain' />
          <View className="items-center mb-6">
            <Text className="text-lg font-bold text-brand-dark">Login To Your Account</Text>
          </View>

          <View className="w-full">
            <FormInput placeholder="Email Address" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
            <PasswordInput value={password} placeholder="Password" onChangeText={setPassword} />
          </View>

          <TouchableOpacity 
            className={`w-full h-14 rounded-2xl justify-center items-center ${isLoading ? 'bg-gray-400' : 'bg-brand'}`}
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? <ActivityIndicator color="#fff" /> : <Text className="text-white font-bold text-lg">LOGIN</Text>}
          </TouchableOpacity>

          <Text className="mt-4 text-mocha text-sm">
            No account yet? <Text className="font-bold text-sm text-brand underline" onPress={() => navigation.navigate('Register')}>Register</Text>
          </Text>
        </View>
      </View>
    </ImageBackground>
  </SafeAreaView>
  );
};

export default LoginScreen;