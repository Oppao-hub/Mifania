import React, { useState, useEffect } from 'react';
import { 
    View, 
    Text, 
    TextInput, 
    TouchableOpacity, 
    ActivityIndicator, 
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
import { RootState } from '../../utils/types';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { getAuth, signInWithCredential, GoogleAuthProvider } from '@react-native-firebase/auth';
import { userGoogleLoginApi } from '../../app/api/auth';
import { AlertMsg } from '../../components/AlertMsg';

GoogleSignin.configure({
    webClientId: '300896200734-ti08h9ju74onbmmsl1v9oq011qtvgj1e.apps.googleusercontent.com',
});

const LoginScreen = () => {
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
            await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
            const hasPrevious = await GoogleSignin.hasPreviousSignIn();
            if (hasPrevious) {
                await GoogleSignin.signOut();
                await new Promise(resolve => setTimeout(() => resolve(null), 500));
            }

            const signInResponse = await GoogleSignin.signIn();
            if (signInResponse.type === 'cancelled') return;

            const idToken = signInResponse.data.idToken;
            if (!idToken) throw new Error("No ID token found.");

            // The API call now returns the parsed data directly
            const serverData = await userGoogleLoginApi(idToken);
            
            const authInstance = getAuth();
            const googleCredential = GoogleAuthProvider.credential(idToken);
            const userCredential = await signInWithCredential(authInstance, googleCredential);
            
            dispatch(userLoginCompleted({
                user: {
                    id: userCredential.user.uid,
                    email: userCredential.user.email || '',
                    firstName: userCredential.user.displayName || 'Google User',
                },
                token: serverData.token || idToken
            }));
            
        } catch (error: any) { 
            AlertMsg.customError({ title: "Google Sign-In Failed", message: error.message || "An unknown error occurred." });
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
                            {/* Email Input */}
                            <View className="flex-row items-center bg-white border border-border-color rounded-2xl px-4 h-16 shadow-sm mb-6">
                                <Icon name="mail-outline" size={20} color="#6A7282" />
                                <TextInput
                                    value={email}
                                    onChangeText={(text) => {
                                        setEmail(text);
                                        if (isError) dispatch(loginReset());
                                    }}
                                    placeholder="Email Address"
                                    className="flex-1 ml-3 text-sm font-bold text-brand-dark"
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    editable={!isLoading}
                                    placeholderTextColor="#9CA3AF"
                                />
                            </View>

                            {/* Password Input */}
                            <View className="flex-row items-center bg-white border border-border-color rounded-2xl px-4 h-16 shadow-sm">
                                <Icon name="lock-closed-outline" size={20} color="#6A7282" />
                                <TextInput
                                    value={password}
                                    onChangeText={(text) => {
                                        setPassword(text);
                                        if (isError) dispatch(loginReset());
                                    }}
                                    placeholder="Password"
                                    className="flex-1 ml-3 text-sm font-bold text-brand-dark"
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
                            <TouchableOpacity 
                                onPress={handleLogin}
                                disabled={isLoading}
                                className={`w-full h-16 rounded-2xl items-center justify-center shadow-lg ${isLoading ? 'bg-brand-light' : 'bg-brand'}`}
                            >
                                {isLoading ? (
                                    <ActivityIndicator color="#ffffff" />
                                ) : (
                                    <Text className="text-white text-base font-bold tracking-widest uppercase">Sign In</Text>
                                )}
                            </TouchableOpacity>

                            {/* Social Login */}
                            <View className="flex-row items-center my-8">
                                <View className="flex-1 h-[1px] bg-border-color" />
                                <Text className="mx-4 text-gray text-[10px] font-bold tracking-widest uppercase">Or continue with</Text>
                                <View className="flex-1 h-[1px] bg-border-color" />
                            </View>

                            <TouchableOpacity 
                                onPress={handleGoogleSignIn}
                                className="w-full h-16 flex-row items-center justify-center rounded-2xl border border-border-color bg-white shadow-sm"
                                disabled={isLoading}
                            >
                                <Image source={IMG.GOOGLE_ICON} className="w-5 h-5 mr-3" resizeMode="contain"/>
                                <Text className="text-dark-gray font-bold text-sm">Google Account</Text>
                            </TouchableOpacity>
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