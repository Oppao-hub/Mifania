import React from 'react';
import { View } from 'react-native';
import { Provider } from 'react-redux';
import { SafeAreaProvider } from 'react-native-safe-area-context';  

import Toast, { BaseToast, ErrorToast, InfoToast, ToastConfig } from 'react-native-toast-message'; 
import configureStore from './src/app/store'; 
import AppNavigation from './src/navigations';

const { store } = configureStore();

const toastConfig: ToastConfig = {
  success: (props) => (
    <BaseToast
      {...props}
      style={{ borderLeftColor: '#52622E', backgroundColor: '#FFFFFF', borderRadius: 8, height: 70 }}
      contentContainerStyle={{ paddingHorizontal: 15 }}
      text1Style={{
        fontSize: 16,
        fontWeight: '700',
        color: '#3F4C23',
        fontFamily: 'Montserrat-Bold'
      }}
      text2Style={{
        fontSize: 13,
        color: '#6A7282',
        fontFamily: 'Montserrat-Regular'
      }}
    />
  ),
  error: (props) => (
    <ErrorToast
      {...props}
      style={{ borderLeftColor: '#DC3545', backgroundColor: '#FFFFFF', borderRadius: 8, height: 70 }}
      text1Style={{
        fontSize: 16,
        fontWeight: '700',
        color: '#DC3545',
        fontFamily: 'Montserrat-Bold'
      }}
      text2Style={{
        fontSize: 13,
        color: '#6A7282',
        fontFamily: 'Montserrat-Regular'
      }}
    />
  ),
  info: (props) => (
    <InfoToast
      {...props}
      style={{ borderLeftColor: '#52622E', backgroundColor: '#FFFFFF', borderRadius: 8, height: 70 }}
      text1Style={{
        fontSize: 16,
        fontWeight: '700',
        color: '#3F4C23',
        fontFamily: 'Montserrat-Bold'
      }}
      text2Style={{
        fontSize: 13,
        color: '#6A7282',
        fontFamily: 'Montserrat-Regular'
      }}
    />
  )
};

const App = () => {
  return (
    <SafeAreaProvider>
      <Provider store={store}>
        <View style={{ flex: 1 }}>
          <AppNavigation />
          <Toast config={toastConfig} />
        </View>
      </Provider>
    </SafeAreaProvider>
  );
};

export default App;