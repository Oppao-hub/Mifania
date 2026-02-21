import React, { useState } from 'react';
import { 
  Alert, View, StyleSheet, Text, TouchableOpacity, SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ROUTES } from '../../utils';

// Assuming these are your local components
import CustomButton from '../../components/CustomButton';
import CustomTextInput from '../../components/CustomTextInput';


const Login = () => {
  const [emailAdd, setEmailAdd] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordHidden, setIsPasswordHidden] = useState(true);
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const navigation = useNavigation();

  const validateEmail = (email) => /\S+@\S+\.\S+/.test(email);

  const handleLogin = () => {
    if (!emailAdd.trim() || !password.trim()) {
      Alert.alert('Missing Fields', 'Please enter email and password.');
      return;
    }else if(!validateEmail(emailAdd)){
      Alert.alert('Invalid email. Please enter a valid email address.');
      return;
    }

    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      if (emailAdd === 'admin@gmail.com' && password === '1234') {
        navigation.navigate(ROUTES.HOME);
      } else {
        Alert.alert('Incorrect Credentials', 'Email or password is incorrect.');
      }
    }, 1000);
  };

  return (
      <SafeAreaView style={styles.mainContainer}>
        <View style={styles.formCard}>
          <Text style={styles.welcomeText}>Welcome to Mifania</Text>
          <Text style={styles.loginNowText}>Login now!</Text>

          <CustomTextInput
            label={'Email'}
            placeholder={'Enter your email'}
            placeHolderStyle={styles.placeHolderStyle}
            value={emailAdd}
            onChangeText={setEmailAdd}
            containerStyle={styles.inputGap}
            labelStyle={styles.floatingLabel} 
            textInputStyle={styles.textInputStyle}
          />

          <CustomTextInput
              label={'Password'}
              placeholder={'Enter your password'}
              placeHolderStyle={styles.placeHolderStyle}
              value={password}
              onChangeText={setPassword}
              containerStyle={styles.inputGap}
              labelStyle={styles.floatingLabel} 
              textInputStyle={styles.textInputStyle}
              secureTextEntry={isPasswordHidden}
            />

          <View>
            <TouchableOpacity onPress={() => setIsPasswordHidden(!isPasswordHidden)}>
              <Text>{isPasswordHidden ? 'Show' : 'Hide'}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.optionsRow}>
            <TouchableOpacity 
                style={styles.checkboxRow} 
                onPress={() => setRememberMe(!rememberMe)}
            >
              <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]} />
              <Text style={styles.lightText}>Remember me</Text>
            </TouchableOpacity>
            <TouchableOpacity>
              <Text style={styles.forgotText}>Forgot password?</Text>
            </TouchableOpacity>
          </View>

          <CustomButton
            label={loading ? 'Logging in...' : 'Login'}
            buttonStyle={styles.buttonStyle}
            buttonTextStyle={styles.buttonTextStyle}
            onPress={handleLogin}
          />

          {/* Social Divider */}
          <View style={styles.dividerRow}>
            <View style={styles.line} />
            <Text style={styles.dividerText}>Or Log in with</Text>
            <View style={styles.line} />
          </View>

          <View style={styles.footerRow}>
            <Text style={styles.lightText}>Didn't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={styles.boldText}>Create an account</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  headerSection: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  brandName: {
    fontSize: 32,
    fontWeight: '400',
    color: '#000',
  },
  formCard: {
    flex: 1,
    backgroundColor: '#FFF',
    borderTopLeftRadius: 35,
    borderTopRightRadius: 35,
    paddingHorizontal: 25,
    paddingTop: 40,
    paddingBottom: 20,
    // Add shadow for iOS/Android if needed
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
  },
  welcomeText: {
    fontSize: 26,
    fontWeight: '700',
    textAlign: 'center',
    color: '#000',
  },
  loginNowText: {
    fontSize: 26,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 30,
    color: '#000',
  },
  inputGap: {
    marginBottom: 20,
    width: '100%',
  },
  textInputStyle: {
    color: '#1e1e1e',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 25,
    height: 55,
    paddingHorizontal: 20,
  },
  placeHolderStyle: {
    color: '#e2e2e2'
  },
  floatingLabel: {
    backgroundColor: '#FFF',
    alignSelf: 'flex-start',
    marginLeft: 20,
    marginBottom: -10, // Pulls label down to sit on the line
    zIndex: 1,
    paddingHorizontal: 5,
    fontSize: 14,
    color: '#666',
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 25,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 18,
    height: 18,
    borderWidth: 1,
    borderColor: '#CCC',
    borderRadius: 25,
    marginRight: 8,
    padding: 2,
  },
  checkboxChecked: {
    backgroundColor: '#1DB954',
  },
  lightText: {
    color: '#888',
    fontSize: 14,
  },
  forgotText: {
    color: '#333',
    fontSize: 14,
  },
  buttonStyle: {
    backgroundColor: '#1DB954', // The green from screenshot
    borderRadius: 30,
    height: 55,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 25,
  },
  buttonTextStyle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 25,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: '#EEE',
  },
  dividerText: {
    marginHorizontal: 10,
    color: '#999',
  },
  socialRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 15,
    marginBottom: 30,
  },
  socialCircle: {
    width: 55,
    height: 55,
    borderRadius: 28,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  boldText: {
    fontWeight: '700',
    color: '#000',
  },
  showHide: {
    alignItems:'flex-end',
    justifyContent: 'flex-end',
  }
});

export default Login;