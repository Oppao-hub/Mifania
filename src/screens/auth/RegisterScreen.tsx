import React, { useCallback, useEffect, useState } from 'react';
import { 
    View, 
    Text, 
    TouchableOpacity, 
    Image, 
    ScrollView, 
    KeyboardAvoidingView, 
    Platform 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import PasswordVisibilityToggle from '../../components/PasswordVisibilityToggle';
import { useNavigation, NavigationProp, useIsFocused, useFocusEffect } from '@react-navigation/native';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

// Redux Imports
import { useDispatch, useSelector } from 'react-redux';
import { userRegister, loginUiReset, userGoogleLogin } from '../../app/reducers/auth';
import { IMG, ROUTES, isValidEmail, validatePasswordStrength } from '../../utils';
import { RootState } from '../../utils/types';
import CustomModal from '../../components/CustomModal';
import FormInput from '../../components/FormInput';
import Button from '../../components/Button';
import FormFieldError from '../../components/FormFieldError';
import { showBlockingError, showBlockingSuccess } from '../../utils/userFeedback';
import { mapAuthErrorMessage } from '../../utils/authErrors';

const RegisterScreen = () => {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [agreeTerms, setAgreeTerms] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);
    
    const navigation = useNavigation<NavigationProp<any>>();
    const dispatch = useDispatch();
    const { isLoading, isError, error, data } = useSelector((state: RootState) => state.authentication);
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

        setFormError(mapAuthErrorMessage(error));
        dispatch(loginUiReset());
    }, [isFocused, isError, error, dispatch]);

    useEffect(() => {
        // Email registration only — Google login sets `token` and AppNavigator switches to Main
        const registerData = data as { token?: string; success?: boolean } | null;
        if (registerData?.success && !registerData.token && !isLoading && !isError) {
            showBlockingSuccess({ 
                title: 'Registration Successful', 
                message: 'Please check your inbox and verify your email before signing in.' 
            });
            navigation.navigate(ROUTES.LOGIN);
        }
    }, [data, isLoading, isError, navigation]);

    const handleRegister = () => {
        setFormError(null);

        if (!firstName.trim() || !lastName.trim() || !email.trim() || !password.trim()) {
            setFormError('Please fill in all fields.');
            return;
        }

        if (!isValidEmail(email)) {
            setFormError('Please enter a valid email address.');
            return;
        }

        const passwordError = validatePasswordStrength(password);
        if (passwordError) {
            setFormError(passwordError);
            return;
        }

        if (!agreeTerms) {
            setFormError('You must agree to the Terms & Conditions.');
            return;
        }
        
        dispatch(userRegister({ 
            firstName, 
            lastName, 
            email, 
            password 
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
            
            let extraInfo = "";
            if (errorCode === '10') {
                extraInfo = "\n\n(Developer Error: This usually means the SHA-1 fingerprint of your app doesn't match the one registered in the Google/Firebase Console.)";
            } else if (errorMessage.toLowerCase().includes('network')) {
                extraInfo = "\n\n(Network Error: Please check your internet connection or verify if your backend server is running and accessible.)";
            }
            
            showBlockingError({ 
                title: 'Google Sign-In Failed', 
                message: `[Code: ${errorCode}] ${errorMessage}${extraInfo}` 
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
                    <View className="my-8">
                        {/* Hero Section */}
                        <View className="my-8 gap-4 items-center">
                            <Text className="text-3xl font-extrabold text-brand-dark tracking-tight">Create Account</Text>
                            <Text className="text-gray text-center font-montserrat">
                                Join Mifania today and start exploring.
                            </Text>
                        </View>

                        {/* Form Section */}
                        <View className="gap-4">
                            <FormFieldError message={formError} variant="banner" className="mb-0" />

                            {/* First Name Input */}
                            <FormInput
                                value={firstName}
                                onChangeText={(text) => {
                                    setFirstName(text);
                                    setFormError(null);
                                }}
                                placeholder="First Name"
                                iconName="person-outline"
                                autoCapitalize="words"
                                editable={!isLoading}
                            />

                            <FormInput
                                value={lastName}
                                onChangeText={(text) => {
                                    setLastName(text);
                                    setFormError(null);
                                }}
                                placeholder="Last Name"
                                iconName="person-outline"
                                autoCapitalize="words"
                                editable={!isLoading}
                            />

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

                            <FormInput
                                value={password}
                                onChangeText={(text) => {
                                    setPassword(text);
                                    setFormError(null);
                                }}
                                placeholder="Password"
                                iconName="lock-closed-outline"
                                secureTextEntry={!isPasswordVisible}
                                rightElement={
                                    <PasswordVisibilityToggle
                                        visible={isPasswordVisible}
                                        onToggle={() => setIsPasswordVisible((v) => !v)}
                                    />
                                }
                            />

                            {/* Terms and Conditions Checkbox */}
                            <View className="flex-row items-center mt-3 ml-1">
                                <TouchableOpacity onPress={() => {
                                    setAgreeTerms(!agreeTerms);
                                    setFormError(null);
                                }}>
                                    <Icon 
                                        name={agreeTerms ? "checkbox" : "square-outline"} 
                                        size={22} 
                                        color={agreeTerms ? "#4A785A" : "#6A7282"}
                                    />
                                </TouchableOpacity>
                                <Text className="ml-3 text-xs font-bold text-gray tracking-wider">
                                    I agree to Mifania <Text className="text-brand">Terms & Conditions</Text>
                                </Text>
                            </View>

                        </View>

                        {/* Action Buttons */}
                        <View className="mt-8">
                            <Button
                                label="Sign Up"
                                onPress={handleRegister}
                                disabled={isLoading}
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
                            <TouchableOpacity onPress={() => navigation.navigate(ROUTES.LOGIN)} disabled={isLoading}>
                                <Text className="text-sm text-gray font-medium">
                                    Already have an account? <Text className="font-bold text-brand">Sign In</Text>
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default RegisterScreen;
