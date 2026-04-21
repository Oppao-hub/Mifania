import React, { useEffect, useState } from 'react';
import { Alert, View, Text, TouchableOpacity, ImageBackground, Image, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { IMG, ROUTES } from '../../utils'; 
import FormInput from '../../components/FormInput';
import PasswordInput from '../../components/PasswordInput';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { userRegister } from '../../app/reducers/auth';

interface RootState {
    authentication: {
        isLoading: boolean;
        isError: boolean;
        error: string | null;
    };
}

const RegisterScreen = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const navigation = useNavigation<NavigationProp<any>>();
  const dispatch = useDispatch();
  const { isLoading, isError, error } = useSelector((state: RootState) => state.authentication);

  useEffect(() => {
    if (isError && error && !isLoading) {
      Alert.alert("Registration Failed", error);
    }
  }, [isError, error, isLoading]);

  const handleRegister = () => {
    if (!firstName.trim() || !lastName.trim() || !email.trim() || !password.trim()) {
      Alert.alert("Input Error", "Please fill in all fields.");
      return;
    }
    
    dispatch(userRegister({ 
        firstName, 
        lastName, 
        email, 
        password 
      })
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <ImageBackground source={IMG.LOGO} className="flex-1" resizeMode="cover">
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
          className="flex-1"
        >
          <ScrollView 
            contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', alignItems: 'center' }}
            showsVerticalScrollIndicator={false}
          >
            <View className="w-[92%] bg-white/80 rounded-[40px] p-8 items-center shadow-xl border border-white/20">
              
              <Image 
                className="w-48 h-12 mb-4"
                source={IMG.LOGO}
                resizeMode="contain"
              />

              <View className="items-center mb-8">
                <View className="h-[1px] w-20 bg-brand/30 mb-2" />
                <Text className="text-xs font-bold text-brand tracking-[3px] uppercase">
                  Create Account
                </Text>
              </View>

              <View className="w-full space-y-2">
                <View className="flex-1">
                  <FormInput 
                    placeholder="First Name" 
                    value={firstName}
                    onChangeText={setFirstName}
                    autoCapitalize="words"
                  />
                </View>

                <View className="flex-1">
                  <FormInput 
                    placeholder="Last Name" 
                    value={lastName}
                    onChangeText={setLastName}
                    autoCapitalize="words"
                  />
                </View>

                <FormInput 
                  placeholder="Email Address" 
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />

                <PasswordInput 
                  placeholder="Password" 
                  value={password}
                  onChangeText={setPassword}
                />
              </View>

              <TouchableOpacity 
                className={`w-full h-14 rounded-2xl justify-center items-center mt-8 shadow-md ${isLoading ? 'bg-brand/50' : 'bg-brand'}`}
                onPress={handleRegister}
                disabled={isLoading}
              >
                {isLoading ? <ActivityIndicator color="#fff" /> : 
                  <Text className="text-white font-bold text-lg">
                    REGISTER
                  </Text>}
              </TouchableOpacity>

              <TouchableOpacity onPress={() => navigation.navigate(ROUTES.LOGIN)} className="mt-6">
                <Text className="text-mocha text-sm">
                  Already have an account? <Text className="font-bold text-brand">Login</Text>
                </Text>
              </TouchableOpacity>
              
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </ImageBackground>
    </SafeAreaView>
  );
};

export default RegisterScreen;