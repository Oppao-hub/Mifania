import React, { useEffect, useState } from 'react';
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
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { userGoogleLoginApi } from '../../app/api/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { getAuth, signInWithCredential, GoogleAuthProvider } from '@react-native-firebase/auth';
import { userLoginCompleted } from '../../app/reducers/auth';

// Redux Imports
import { useDispatch, useSelector } from 'react-redux';
import { userRegister, registerReset } from '../../app/reducers/auth';
import { IMG, ROUTES } from '../../utils';
import { RootState } from '../../utils/types';
import CustomModal from '../../components/CustomModal';
import { AlertMsg } from '../../components/AlertMsg';
import FormInput from '../../components/FormInput';
import Button from '../../components/Button';

const RegisterScreen = () => {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [agreeTerms, setAgreeTerms] = useState(false);
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);
    
    const navigation = useNavigation<NavigationProp<any>>();
    const dispatch = useDispatch();
    const { isLoading, isError, error, data } = useSelector((state: RootState) => state.authentication);

    useEffect(() => {
        dispatch(registerReset());
    }, [dispatch]);

    useEffect(() => {
        if (data && !isLoading && !isError) {
            AlertMsg.customSuccess({ 
                title: "Registration Successful", 
                message: "Please check your inbox and verify your email before signing in." 
            });
            navigation.navigate(ROUTES.LOGIN);
        }
    }, [data, isLoading, isError, navigation]);

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

        if (!agreeTerms) {
            AlertMsg.customError({ title: "Input Error", message: "You must agree to the Terms & Conditions." });
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

            setIsGoogleLoading(true);

            const idToken = signInResponse.data.idToken;
            if (!idToken) throw new Error("No ID token found from Google.");

            console.log("📍 Google Sign-In: Exchanging token with backend...");
            const serverData = await userGoogleLoginApi(idToken);
            
            console.log("📍 Google Sign-In: Syncing with Firebase...");
            const authInstance = getAuth();
            const googleCredential = GoogleAuthProvider.credential(idToken);
            const userCredential = await signInWithCredential(authInstance, googleCredential);
            
            console.log("📍 Google Sign-In: Login completed.");
            dispatch(userLoginCompleted({
                user: serverData.user || {
                    email: userCredential.user.email || '',
                },
                token: serverData.token || idToken
            }));
            
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
            
            AlertMsg.customError({ 
                title: "Google Sign-In Failed", 
                message: `[Code: ${errorCode}] ${errorMessage}${extraInfo}` 
            });
        } finally {
            setIsGoogleLoading(false);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-app-bg" edges={['top']}>
            <CustomModal 
                visible={isLoading}
                isLoading={true}
                message="Creating account..."
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
                        <View className="space-y-4">
                            {/* First Name Input */}
                            <FormInput
                                value={firstName}
                                onChangeText={(text) => { setFirstName(text); if (isError) dispatch(registerReset()); }}
                                placeholder="First Name"
                                iconName="person-outline"
                                autoCapitalize="words"
                                editable={!isLoading}
                            />

                            <FormInput
                                value={lastName}
                                onChangeText={(text) => { setLastName(text); if (isError) dispatch(registerReset()); }}
                                placeholder="Last Name"
                                iconName="person-outline"
                                autoCapitalize="words"
                                editable={!isLoading}
                            />

                            <FormInput
                                value={email}
                                onChangeText={(text) => {
                                    setEmail(text);
                                    if (isError) dispatch(registerReset());
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
                                    if (isError) dispatch(registerReset());
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

                            {/* Terms and Conditions Checkbox */}
                            <View className="flex-row items-center mt-3 ml-1">
                                <TouchableOpacity onPress={() => setAgreeTerms(!agreeTerms)}>
                                    <Icon 
                                        name={agreeTerms ? "checkbox" : "square-outline"} 
                                        size={22} 
                                        color={agreeTerms ? "#4A785A" : "#6A7282"} // Adjust color to your brand
                                    />
                                </TouchableOpacity>
                                <Text className="ml-3 text-xs font-bold text-gray tracking-wider">
                                    I agree to Mifania <Text className="text-brand">Terms & Conditions</Text>
                                </Text>
                            </View>

                            {/* Error Message */}
                            {isError && error ? (
                                <Text className="text-red-500 text-xs font-montserrat-medium ml-1 mt-1">
                                    {error}
                                </Text>
                            ) : null}
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
                                disabled={isLoading || isGoogleLoading}
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