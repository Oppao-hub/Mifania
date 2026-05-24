import React, { useState, useEffect } from 'react';
import { 
    View, 
    Text, 
    TouchableOpacity, 
    Image, 
    KeyboardAvoidingView, 
    Platform, 
    ScrollView 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation, NavigationProp } from '@react-navigation/native';

// Redux Imports
import { useDispatch, useSelector } from 'react-redux';
import { userLogin, loginReset } from '../../app/reducers/auth';
import { IMG, ROUTES } from '../../utils';
import { RootState } from '../../utils/types';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { AlertMsg } from '../../components/AlertMsg';
import CustomModal from '../../components/CustomModal';
import FormInput from '../../components/FormInput'
import Button from '../../components/Button';

const LoginScreen = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [isGoogleLoading] = useState(false);
    
    const navigation = useNavigation<NavigationProp<any>>();
    const dispatch = useDispatch();

    const { isLoading, isError, error } = useSelector((state: RootState) => state.authentication);

    useEffect(() => {
        GoogleSignin.configure({
            webClientId: '300896200734-ti08h9ju74onbmmsl1v9oq011qtvgj1e.apps.googleusercontent.com',
            offlineAccess: true,
            forceCodeForRefreshToken: true,
        });
    }, []);

    useEffect(() => {
        if (isError && error) {
            AlertMsg.customError({ title: "Login Failed", message: error });
        }
    }, [isError, error]);

    const handleLogin = () => {
        if (!email.trim() || !password.trim()) {
            AlertMsg.customError({ title: "Input Error", message: "Please enter your credentials." });
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            AlertMsg.customError({ title: "Input Error", message: "Please enter a valid email address." });
            return;
        }
        
        dispatch(userLogin({ 
            email: email, 
            password: password 
        }));
    };

    const handleGoogleSignIn = async () => {
        try {
            console.log("📍 Google Sign-In: Checking Play Services...");
            await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
            
            try {
                await GoogleSignin.signOut();
            } catch {
                // Ignore sign out errors
            }

            console.log("📍 Google Sign-In: Opening account picker...");
            const signInResponse = await GoogleSignin.signIn();
            
            if (signInResponse.type === 'cancelled') {
                console.log("📍 Google Sign-In: Cancelled by user.");
                return;
            }

            const idToken = signInResponse.data.idToken;
            if (!idToken) throw new Error("No ID token found from Google.");

            // 💡 THE FIX: Stop calling the API here! Just dispatch to your Saga.
            // (Assuming your action type is USER_GOOGLE_LOGIN)
            dispatch({ 
                type: 'USER_GOOGLE_LOGIN', 
                payload: { idToken } 
            });
            
        } catch (signInError: any) { 
            console.log("❌ Google Sign-In Error details:", signInError);
            const errorCode = signInError.code || "unknown";
            const errorMessage = signInError.message || "An unknown error occurred.";
            
            AlertMsg.customError({ 
                title: "Google Sign-In Failed", 
                message: `[Code: ${errorCode}] ${errorMessage}` 
            });
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-app-bg" edges={['top']}>
            <CustomModal 
                visible={isLoading || isGoogleLoading}
                isLoading={true}
                message="Signing in..."
            />
            
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
                    <View className="my-24">
                        {/* Hero Section */}
                        <View className="my-16 gap-4 items-center">
                            <Text className="text-3xl font-extrabold text-brand-dark tracking-tight">Sign In</Text>
                            <Text className="text-gray text-center font-montserrat">
                                Experience the future of fashion.
                            </Text>
                        </View>

                        {/* Form Section */}
                        <View className="space-y-4">
                            <FormInput
                                value={email}
                                onChangeText={(text) => {
                                    setEmail(text);
                                    if (isError) dispatch(loginReset());
                                }}
                                placeholder="Email Address"
                                iconName="mail-outline" // Icon matches your reference image
                                keyboardType="email-address" // Ensures the @ symbol is on the keyboard
                                autoCapitalize="none" // Essential for emails
                                editable={!isLoading}
                                inputClassName={isError && error?.toLowerCase().includes('email') ? 'border-red-500' : ''}
                            />

                            <FormInput
                                value={password}
                                onChangeText={(text) => {
                                    setPassword(text);
                                    if (isError) dispatch(loginReset());
                                }}
                                placeholder="Password"
                                iconName="lock-closed-outline" // Icon matches your reference image
                                secureTextEntry={!isPasswordVisible}
                                rightElement={
                                    <TouchableOpacity onPress={() => setIsPasswordVisible(!isPasswordVisible)}>
                                        <Icon 
                                            name={isPasswordVisible ? "eye-off-outline" : "eye-outline"} 
                                            size={20} 
                                            color="#6A7282" 
                                        />
                                    </TouchableOpacity>
                                }
                            />

                            {/* Forgot Password */}
                            <TouchableOpacity 
                                onPress={() => AlertMsg.customInfo({ title: "Reset Password", message: "Coming soon!" })}
                                className="items-end mt-3"
                            >
                                <Text className="text-xs font-bold text-brand tracking-wider">Forgot Password?</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Action Buttons */}
                        <View className="mt-10">
                            <Button
                                label="Sign In"
                                onPress={handleLogin}
                                isLoading={isLoading}
                                variant="primary"
                            />  

                            {/* Social Login */}
                            <View className="flex-row items-center my-8">
                                <View className="flex-1 h-[1px] bg-border-color" />
                                <Text className="mx-4 text-gray text-[10px] font-bold tracking-widest uppercase">Or</Text>
                                <View className="flex-1 h-[1px] bg-border-color" />
                            </View>
                            
                            <Button
                                label="Continue with Google"
                                onPress={handleGoogleSignIn}
                                disabled={isLoading || isGoogleLoading}
                                variant="secondary"
                                leftElement={<Image source={IMG.GOOGLE_ICON} className="w-5 h-5 mr-3" resizeMode="contain"/>}
                            />
                        </View>

                        {/* Footer */}
                        <View className="mt-auto py-10 items-center">
                            <TouchableOpacity onPress={() => navigation.navigate(ROUTES.REGISTER)} disabled={isLoading || isGoogleLoading}>
                                <Text className="text-sm text-gray font-medium">
                                    Don't have an account? <Text className="font-bold text-brand">Create Account</Text>
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default LoginScreen;