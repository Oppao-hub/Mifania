import { useState } from 'react';
import { Alert, View, StyleSheet } from 'react-native';

import CustomButton from '../../components/CustomButton';
import CustomTextInput from '../../components/CustomTextInput';
import { useNavigation } from '@react-navigation/native';
import { ROUTES } from '../../utils';

const Login = () => {
  const [emailAdd, setEmailAdd] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const validateEmail = email => {
    const regEx = /\S+@\S+\.\S+/;

    return regEx.test(email);
  };

  const navigation = useNavigation();

  const handleLogin = () => {
    if (!emailAdd.trim() || !password.trim()) {
      Alert.alert('Missing Fields', 'Please enter email and password.');
      return;
    }

    if (!validateEmail(emailAdd)) {
      navigation.navigate('Profile');
    } else {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
    }

    setLoading(true);

    setTimeout(() => {
      setLoading(false);

      if(emailAdd === 'admin@gmail.com' && password === '1234'){
        navigation.navigate(ROUTES.HOME);
      }else{
        Alert.alert('Incorrect Credentials', 'Email or password is incorrect.')
        return;
      }
    }, 1000);
  };

  return (
    <View style={{ 
      flex: 1, 
      justifyContent: 'center', 
      alignItems: 'center', 
      padding: 20 
    }}>
      
      <CustomTextInput
        label={'Email Address'}
        placeholder={'Enter your email address'}
        value={emailAdd}
        onChangeText={setEmailAdd}
        containerStyle={{ width: '100%' }}
        labelStyle={{ fontSize: 20, fontWeight: '500' }}
        textStyle={{ fontSize: 20 }}
      />

      <CustomTextInput
        label={'Password'}
        placeholder={'Enter your password'}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        containerStyle={ styles.container }
        labelStyle={ styles.labelStyle }
        textStyle={ styles.textStyle }
        textInputStyle={ styles.textInputStyle }
      />

      <CustomButton
        label={loading ? 'Logging in...' : 'LOGIN'}
        containerStyle
        onPress={handleLogin}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%'
  },
  input: {
    width: '100%',
    marginBottom: 20,
  },
  labelStyle: {
    fontSize: 20, 
    fontWeight: '500',
  },
  textStyle: {
    fontSize: 20,
  },
  textInputStyle: {
    width: '80%',
    borderBottomWidth: 1,
  }
});

export default Login;
