import React, { useState, useEffect, useCallback } from 'react';
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
import PasswordVisibilityToggle from '../../components/PasswordVisibilityToggle';
import { useNavigation, useIsFocused, useFocusEffect } from '@react-navigation/native';
import type { AuthNavigationProp } from '../../types/navigation';

// Redux Imports
import { useDispatch, useSelector } from 'react-redux';
import { userLogin, loginUiReset, userGoogleLogin } from '../../app/reducers/auth';
import { IMG, ROUTES, isValidEmail } from '../../utils';
import { RootState } from '../../utils/types';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import CustomModal from '../../components/CustomModal';
import FormInput from '../../components/FormInput';
import FormFieldError from '../../components/FormFieldError';
import Button from '../../components/Button';
import { showBlockingError } from '../../utils/userFeedback';
import { getLoginErrorPresentation } from '../../utils/authErrors';

const LoginScreen = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);
    
    const navigation = useNavigation<AuthNavigationProp>();
    const dispatch = useDispatch();

    const { isLoading, isError, error } = useSelector((state: RootState) => state.authentication);
    const isFocused = useIsFocused();

    useFocusEffect(
        useCallback(() => {
            dispatch(loginUiReset());
            setFormError(null);

            return () => {
                dispatch(loginUiReset());
            };
        }, [dispatch]),
    );

    useEffect(() => {
        if (!isFocused || !isError || !error) {
            return;
        }

        const presentation = getLoginErrorPresentation(error);

        if (presentation.style === 'inline') {
            setFormError(presentation.message);
        } else {
            showBlockingError({
                title: presentation.title,
                message: presentation.message,
            });
        }

        dispatch(loginUiReset());
    }, [isFocused, isError, error, dispatch]);

    const handleLogin = () => {
        if (isLoading) {
            return;
        }

        setFormError(null);

        if (!email.trim() || !password.trim()) {
            setFormError('Please enter your email and password.');
            return;
        }

        if (!isValidEmail(email)) {
            setFormError('Please enter a valid email address.');
            return;
        }
        
        dispatch(userLogin({ 
            email: email, 
            password: password 
        }));
    };

    const handleGoogleSignIn = async () => {
        if (isLoading) {
            return;
        }

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

            const idToken = signInResponse.data?.idToken;
            if (!idToken) {
                throw new Error('No ID token found from Google.');
            }

            dispatch(userGoogleLogin(idToken));
            
        } catch (signInError: any) { 
            console.log("❌ Google Sign-In Error details:", signInError);
            const errorCode = signInError.code || "unknown";
            const errorMessage = signInError.message || "An unknown error occurred.";
            
            showBlockingError({ 
                title: 'Google Sign-In Failed', 
                message: `[Code: ${errorCode}] ${errorMessage}` 
            });
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-app-bg" edges={['top']}>
            <CustomModal 
                visible={isLoading}
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
                        <View className="gap-1">
                            <FormFieldError message={formError} variant="banner" className="mb-2" />

                            <FormInput
                                value={email}
                                onChangeText={(text) => {
                                    setEmail(text);
                                    setFormError(null);
                                }}
                                placeholder="Email Address"
                                iconName="mail-outline"
                                keyboardType="email-address"
                                autoCapitalize="none"
                                editable={!isLoading}
                            />

                            <View className="flex-row justify-end gap-4">
                                {formError?.toLowerCase().includes('verify') ? (
                                    <TouchableOpacity
                                        onPress={() => navigation.navigate(ROUTES.RESEND_VERIFICATION)}
                                        disabled={isLoading}
                                    >
                                        <Text className="text-xs font-bold text-brand tracking-wider">
                                            Resend verification
                                        </Text>
                                    </TouchableOpacity>
                                ) : null}
                                <TouchableOpacity
                                    onPress={() => navigation.navigate(ROUTES.FORGOT_PASSWORD)}
                                    disabled={isLoading}
                                >
                                    <Text className="text-xs font-bold text-brand tracking-wider">
                                        Forgot Password?
                                    </Text>
                                </TouchableOpacity>
                            </View>

                            <FormInput
                                value={password}
                                onChangeText={(text) => {
                                    setPassword(text);
                                    setFormError(null);
                                }}
                                placeholder="Password"
                                iconName="lock-closed-outline" // Icon matches your reference image
                                secureTextEntry={!isPasswordVisible}
                                rightElement={
                                    <PasswordVisibilityToggle
                                        visible={isPasswordVisible}
                                        onToggle={() => setIsPasswordVisible((v) => !v)}
                                    />
                                }
                            />
                        </View>

                        {/* Action Buttons */}
                        <View className="mt-5">
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
                                disabled={isLoading}
                                variant="secondary"
                                leftElement={<Image source={IMG.GOOGLE_ICON} className="w-5 h-5 mr-3" resizeMode="contain"/>}
                            />
                        </View>

                        {/* Footer */}
                        <View className="mt-auto py-10 items-center">
                            <TouchableOpacity onPress={() => navigation.navigate(ROUTES.REGISTER)} disabled={isLoading}>
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