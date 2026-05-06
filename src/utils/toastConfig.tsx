import React from 'react';
import { BaseToast, ErrorToast, InfoToast, ToastConfig } from 'react-native-toast-message';

/**
 * Global configuration for react-native-toast-message.
 * Styled to match the Mifania brand palette and typography.
 */
export const toastConfig: ToastConfig = {
  success: (props) => (
    <BaseToast
      {...props}
      style={{ 
        borderLeftColor: '#52622E', // brand-DEFAULT
        backgroundColor: '#FFFFFF', 
        borderRadius: 12, 
        height: 70,
        borderLeftWidth: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
      }}
      contentContainerStyle={{ paddingHorizontal: 15 }}
      text1Style={{
        fontSize: 15,
        color: '#3F4C23', // brand-dark
        fontFamily: 'Montserrat-Bold'
      }}
      text2Style={{
        fontSize: 12,
        color: '#6A7282', // gray
        fontFamily: 'Montserrat-Regular'
      }}
    />
  ),
  error: (props) => (
    <ErrorToast
      {...props}
      style={{ 
        borderLeftColor: '#DC3545', // danger
        backgroundColor: '#FFFFFF', 
        borderRadius: 12, 
        height: 70,
        borderLeftWidth: 5,
      }}
      text1Style={{
        fontSize: 15,
        color: '#DC3545',
        fontFamily: 'Montserrat-Bold'
      }}
      text2Style={{
        fontSize: 12,
        color: '#6A7282',
        fontFamily: 'Montserrat-Regular'
      }}
    />
  ),
  info: (props) => (
    <InfoToast
      {...props}
      style={{ 
        borderLeftColor: '#52622E', 
        backgroundColor: '#FFFFFF', 
        borderRadius: 12, 
        height: 70,
        borderLeftWidth: 5,
      }}
      text1Style={{
        fontSize: 15,
        color: '#3F4C23',
        fontFamily: 'Montserrat-Bold'
      }}
      text2Style={{
        fontSize: 12,
        color: '#6A7282',
        fontFamily: 'Montserrat-Regular'
      }}
    />
  )
};
