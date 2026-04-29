import React, { useEffect, useState } from 'react';
import { 
    View, 
    Text, 
    TextInput, 
    TouchableOpacity, 
    Image, 
    ScrollView, 
    KeyboardAvoidingView, 
    Platform, 
    ActivityIndicator 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation, NavigationProp } from '@react-navigation/native';

// Redux Imports
import { useDispatch, useSelector } from 'react-redux';
import { userRegister, loginReset } from '../../app/reducers/auth';
import { IMG, ROUTES } from '../../utils';
import { RootState } from '../../types';
import { AlertMsg } from '../../components/AlertMsg';

const RegisterScreen = () => {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    
    const navigation = useNavigation<NavigationProp<any>>();
    const dispatch = useDispatch();
    const { isLoading, isError, error } = useSelector((state: RootState) => state.authentication);

    useEffect(() => {
        dispatch(loginReset());
    }, [dispatch]);

    useEffect(() => {
        if (isError && error && !isLoading) {
            AlertMsg.customError({ title: "Registration Failed", message: error });
        }
    }, [isError, error, isLoading]);

    const handleRegister = () => {
        if (!firstName.trim() || !lastName.trim() || !email.trim() || !password.trim()) {
            AlertMsg.customError({ title: "Input Error", message: "Please fill in all fields." });
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            AlertMsg.customError({ title: "Input Error", message: "Please enter a valid email address." });
            return;
        }
        
        dispatch(userRegister({ 
            firstName, 
            lastName, 
            email, 
            password 
        }));
    };

    return (
        <SafeAreaView className="flex-1 bg-app-bg" edges={['top']}>
            <KeyboardAvoidingView 
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                className="flex-1"
            >
                <ScrollView 
                    contentContainerStyle={{ flexGrow: 1 }}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                    className="flex-1 px-6"
                >
                    {/* Hero Section */}
                    <View className="mt-8 mb-8 items-center">
                        <View className="w-20 h-20 bg-white rounded-[25px] items-center justify-center shadow-sm border border-border-color mb-4">
                            <Image 
                                source={IMG.LOGO} 
                                className="w-12 h-12"
                                resizeMode="contain"
                            />
                        </View>
                        <Text className="text-2xl font-extrabold text-brand-dark tracking-tight">Create Account</Text>
                        <Text className="text-gray mt-1 font-montserrat text-sm">Join the Mifania community today.</Text>
                    </View>

                    {/* Form Section */}
                    <View className="space-y-4">
                        {/* First Name Input */}
                        <View className="flex-row items-center bg-white border border-border-color rounded-2xl px-4 h-15 shadow-sm mb-4">
                            <Icon name="person-outline" size={20} color="#6A7282" />
                            <TextInput
                                value={firstName}
                                onChangeText={setFirstName}
                                placeholder="First Name"
                                className="flex-1 ml-3 text-sm font-bold text-brand-dark h-14"
                                autoCapitalize="words"
                                editable={!isLoading}
                                placeholderTextColor="#9CA3AF"
                            />
                        </View>

                        {/* Last Name Input */}
                        <View className="flex-row items-center bg-white border border-border-color rounded-2xl px-4 h-15 shadow-sm mb-4">
                            <Icon name="person-outline" size={20} color="#6A7282" />
                            <TextInput
                                value={lastName}
                                onChangeText={setLastName}
                                placeholder="Last Name"
                                className="flex-1 ml-3 text-sm font-bold text-brand-dark h-14"
                                autoCapitalize="words"
                                editable={!isLoading}
                                placeholderTextColor="#9CA3AF"
                            />
                        </View>

                        {/* Email Input */}
                        <View className="flex-row items-center bg-white border border-border-color rounded-2xl px-4 h-15 shadow-sm mb-4">
                            <Icon name="mail-outline" size={20} color="#6A7282" />
                            <TextInput
                                value={email}
                                onChangeText={setEmail}
                                placeholder="Email Address"
                                className="flex-1 ml-3 text-sm font-bold text-brand-dark h-14"
                                keyboardType="email-address"
                                autoCapitalize="none"
                                editable={!isLoading}
                                placeholderTextColor="#9CA3AF"
                            />
                        </View>

                        {/* Password Input */}
                        <View className="flex-row items-center bg-white border border-border-color rounded-2xl px-4 h-15 shadow-sm">
                            <Icon name="lock-closed-outline" size={20} color="#6A7282" />
                            <TextInput
                                value={password}
                                onChangeText={setPassword}
                                placeholder="Password"
                                className="flex-1 ml-3 text-sm font-bold text-brand-dark h-14"
                                secureTextEntry={!isPasswordVisible}
                                editable={!isLoading}
                                placeholderTextColor="#9CA3AF"
                            />
                            <TouchableOpacity onPress={() => setIsPasswordVisible(!isPasswordVisible)}>
                                <Icon 
                                    name={isPasswordVisible ? "eye-off-outline" : "eye-outline"} 
                                    size={20} 
                                    color="#6A7282" 
                                />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Action Button */}
                    <View className="mt-10">
                        <TouchableOpacity 
                            onPress={handleRegister}
                            disabled={isLoading}
                            className={`w-full h-16 rounded-2xl items-center justify-center shadow-lg ${isLoading ? 'bg-brand-light' : 'bg-brand'}`}
                        >
                            {isLoading ? (
                                <ActivityIndicator color="#ffffff" />
                            ) : (
                                <Text className="text-white text-base font-bold tracking-widest uppercase">Sign Up</Text>
                            )}
                        </TouchableOpacity>
                    </View>

                    {/* Footer */}
                    <View className="mt-auto py-10 items-center">
                        <TouchableOpacity onPress={() => navigation.navigate(ROUTES.LOGIN)} disabled={isLoading}>
                            <Text className="text-sm text-gray font-medium">
                                Already have an account? <Text className="font-bold text-brand">Sign In</Text>
                            </Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default RegisterScreen;