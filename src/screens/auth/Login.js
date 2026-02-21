import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ImageBackground, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IMG }from '../../utils'; 
import FormInput from '../../components/FormInput';
import PasswordInput from '../../components/PasswordInput';
import { useNavigation } from '@react-navigation/native';

const Login = () => {
  const [email, setEmail] = useState(false);
  const [password, setPassword] = useState('');
  const [agree, setAgree] = useState(false);
  const navigation = useNavigation();

  return (
    <ImageBackground
      source={ IMG.REGISTER_BG } 
      className="flex-1 justify-center items-center"
    >
      <SafeAreaView className="w-full items-center">

        <View className="w-[90%] bg-white/50 rounded-[40px] p-8 items-center shadow-2xl">
          <Image 
            className="w-full h-10"
            source={IMG.LOGO}
            resizeMode='contain'
          />
          <View className="items-center mb-6">
            <View className="h-[2px] w-32 bg-brand-dark my-3" />
              <Text className="text-lg font-bold text-brandLight border-b-2 border-brandLight">
                Login To Your Account
              </Text>
            </View>

            <View className="w-full">
              <FormInput 
                placeholder="Email Address" 
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
              />

              <PasswordInput 
                value={password}
                placeholder="Password" 
                onChangeText={setPassword}
                secureTextEntry={true}
              />
            </View>

            {/* Checkbox Section - Using --color-green-500 */}
            <TouchableOpacity 
              onPress={() => setAgree(!agree)}
              className="flex-row items-center self-start mt-4 mb-6"
            >
              <View className={`w-5 h-5 border border-gray-400 rounded-md mr-2 justify-center items-center ${agree ? 'bg-brandDark' : 'bg-white'}`}>
                {agree && <Text className="text-white text-[10px]">✓</Text>}
              </View>
              <Text className="text-sm text-mocha">
                Remember me
              </Text>
            </TouchableOpacity>

            {/* Register Button - Using --color-brand */}
            <TouchableOpacity className="w-full bg-brand h-14 rounded-2xl justify-center items-center shadow-lg active:bg-brand-dark">
              <Text className="text-white font-bold text-lg tracking-widest">LOGIN</Text>
            </TouchableOpacity>

            {/* Footer */}
            <Text className="mt-4 text-mocha text-sm">
              No account yet? <Text className="font-bold text-sm text-brand underline" onPress={() => navigation.navigate('Register')}>Register</Text>
            </Text>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
};

export default Login;