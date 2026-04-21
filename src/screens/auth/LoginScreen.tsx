import React, { useState, useEffect } from 'react';
import { 
    View, 
    Text, 
    TextInput, 
    TouchableOpacity, 
    ActivityIndicator, 
    Alert, 
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
import { userLogin, loginReset, userLoginCompleted } from '../../app/reducers/auth';
import { IMG, ROUTES } from '../../utils';
import { RootState } from '../../types';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { getAuth, signInWithCredential, GoogleAuthProvider } from '@react-native-firebase/auth';
import { userGoogleLoginApi } from '../../app/api/auth';

GoogleSignin.configure({
    webClientId: '300896200734-ti08h9ju74onbmmsl1v9oq011qtvgj1e.apps.googleusercontent.com',
});

const LoginScreen = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    
    const navigation = useNavigation<NavigationProp<any>>();
    const dispatch = useDispatch();

    // Pulling state from your existing Redux slice
    const { isLoading, isError, error } = useSelector((state: RootState) => state.authentication);

    // Clear any previous error state on component mount
    useEffect(() => {
        dispatch(loginReset());
    }, [dispatch]);

    const handleLogin = () => {
        if (!email.trim() || !password.trim()) {
            Alert.alert("Input Error", "Please enter your credentials.");
            return;
        }

        // Basic Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            Alert.alert("Input Error", "Please enter a valid email address.");
            return;
        }
        
        // Dispatching your specific Redux action
        dispatch(
            userLogin({
                email: email,
                password: password,
            })
        );
    };

    const handleGoogleSignIn = async () => {
        try {
            await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

            // Force the account picker to appear by signing out first
            // Only sign out if we are already signed in to prevent activity errors
            const hasPrevious = await GoogleSignin.hasPreviousSignIn();
            if (hasPrevious) {
                await GoogleSignin.signOut();
                // Give the native side a moment to settle before signing in again
                await new Promise(resolve => setTimeout(() => resolve(null), 500));
            }

            const signInResponse = await GoogleSignin.signIn();
            
            if (signInResponse.type === 'cancelled') {
                return;
            }

            const idToken = signInResponse.data.idToken;

            if (!idToken) {
                throw new Error("No ID token found in Google response.");
            }

            // 1. VERIFY WITH SYMFONY SERVER
            const response = await userGoogleLoginApi(idToken);
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to verify Google account with server.");
            }

            const serverData = await response.json();

            // 2. USING THE NEW MODULAR FIREBASE SYNTAX
            const authInstance = getAuth();
            const googleCredential = GoogleAuthProvider.credential(idToken);
            const userCredential = await signInWithCredential(authInstance, googleCredential);
            
            console.log("Signed in with Google! User:", userCredential.user.email);
            
            // 3. Redirect 
            dispatch(userLoginCompleted({
                user: {
                    email: userCredential.user.email || '',
                    first_name: userCredential.user.displayName || 'Google User',
                },
                token: serverData.token || idToken
            }));
            
        } catch (error: any) { 
            console.error("Google Sign-In Error:", error);
            Alert.alert("Google Sign-In Failed", error.message || "An unknown error occurred.");
        }
    };

    const onInputChange = (setter: React.Dispatch<React.SetStateAction<string>>) => (text: string) => {
        setter(text);
        if (isError) {
            dispatch(loginReset());
        }
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
                    className="flex-1 px-6 pt-10"
                >
                    {/* Header Section */}
                    <Image 
                        source={IMG.LOGO} 
                        className="w-72 h-72 self-center"
                        resizeMode="contain"
                    />

                    <View className="mb-10">
                        <Text className="text-2xl font-bold text-brand-dark mb-2">Sign In</Text>
                        <Text className="text-sm text-gray font-medium tracking-widest">
                            Fill in your credentials to access your account.
                        </Text>
                    </View>

                    {/* Inline Error Message */}
                    {isError && error && (
                        <View className="bg-red-50 p-4 rounded-sm border border-red-100 flex-row items-center mb-6">
                            <Icon name="alert-circle-outline" size={16} color="#dc2626" />
                            <Text className="text-red-600 text-[10px] font-bold tracking-widest ml-3 flex-1">
                                {error}
                            </Text>
                        </View>
                    )}

                    {/* Email Input */}
                    <View className="mb-6">
                        <Text className="text-[10px] font-bold text-gray tracking-[0.2em] uppercase mb-2">
                            Email Address
                        </Text>
                        <TextInput
                            value={email}
                            onChangeText={onInputChange(setEmail)}
                            placeholder="e.g. paolo@mifania.com"
                            className="w-full px-4 py-3 bg-white border border-border-color rounded-sm text-sm font-bold text-brand-dark"
                            keyboardType="email-address"
                            autoCapitalize="none"
                            editable={!isLoading}
                        />
                    </View>

                    {/* Password Input */}
                    <View className="mb-8">
                        <View className="flex-row justify-between items-center mb-2">
                            <Text className="text-[10px] font-bold text-gray tracking-[0.2em] uppercase">
                                Password
                            </Text>
                            <TouchableOpacity onPress={() => Alert.alert("Reset Password", "Coming soon!")}>
                                <Text className="text-[10px] font-bold text-brand tracking-widest uppercase">Forgot Password?</Text>
                            </TouchableOpacity>
                        </View>
                        
                        <View className="relative">
                            <TextInput
                                value={password}
                                onChangeText={onInputChange(setPassword)}
                                placeholder="••••••••"
                                className="w-full px-4 py-3 bg-white border border-border-color rounded-sm text-sm font-bold text-brand-dark"
                                secureTextEntry={!isPasswordVisible}
                                editable={!isLoading}
                            />
                            <TouchableOpacity 
                                onPress={() => setIsPasswordVisible(!isPasswordVisible)}
                                className="absolute right-4 top-3.5"
                            >
                                <Icon 
                                    name={isPasswordVisible ? "eye-off-outline" : "eye-outline"} 
                                    size={18} 
                                    color="#6A7282" 
                                />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Submit Button */}
                    <TouchableOpacity 
                        onPress={handleLogin}
                        disabled={isLoading}
                        className={`w-full h-14 rounded-sm items-center justify-center shadow-md ${isLoading ? 'bg-brand-light' : 'bg-brand'}`}
                    >
                        {isLoading ? (
                            <ActivityIndicator color="#ffffff" />
                        ) : (
                            <Text className="text-white text-sm font-bold tracking-[0.2em] uppercase">Sign In</Text>
                        )}
                    </TouchableOpacity>

                    {/* Social Gateways Divider */}
                    <View className="flex-row items-center my-8">
                        <View className="flex-1 h-[1px] bg-border-color" />
                        <Text className="mx-4 text-gray text-[10px] font-bold tracking-widest uppercase">Social Gateways</Text>
                        <View className="flex-1 h-[1px] bg-border-color" />
                    </View>

                    {/* Google Button - Placeholder for functionality */}
                    <TouchableOpacity 
                        onPress={handleGoogleSignIn}
                        className="w-full flex-row items-center justify-center py-4 rounded-sm border border-border-color bg-white shadow-sm"
                        disabled={isLoading}
                    >
                        <Image source={IMG.GOOGLE_ICON} className="w-5 h-5 mr-3" resizeMode="contain"/>
                        <Text className="ml-3 text-dark-gray font-bold text-[10px] tracking-widest uppercase">
                            Sign in with Google
                        </Text>
                    </TouchableOpacity>

                    {/* Footer */}
                    <View className="mt-10 mb-6 items-center">
                        <TouchableOpacity onPress={() => navigation.navigate(ROUTES.REGISTER)} disabled={isLoading}>
                            <Text className="text-sm text-gray font-medium">
                                New to Mifania? <Text className="font-bold text-brand tracking-widest">Create an Account</Text>
                            </Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default LoginScreen;