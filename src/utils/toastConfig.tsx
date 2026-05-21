import React from 'react';
import { View, Text, TouchableOpacity, Dimensions } from 'react-native';
import { BaseToast, ErrorToast, ToastConfig } from 'react-native-toast-message';
import Icon from 'react-native-vector-icons/Ionicons';
import Toast from 'react-native-toast-message';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

/**
 * Custom Modal-like component for Toast.
 * Styled with NativeWind to appear centered over a backdrop.
 * We avoid the 'Modal' component here to let the Toast library manage the lifecycle.
 */
const ModalToast = ({ 
  text1, 
  text2, 
  type = 'info', 
  iconName,
}: { 
  text1?: string, 
  text2?: string, 
  type?: 'success' | 'error' | 'info',
  iconName: string,
}) => {
  const colors = {
    success: '#52622E',
    error: '#DC3545',
    info: '#52622E',
  };

  const getPrimaryBtnColor = () => {
    if (type === 'error') return 'bg-danger';
    return 'bg-brand';
  };

  const getIconContainerColor = () => {
    if (type === 'error') return 'bg-danger/10';
    return 'bg-brand/10';
  };

  return (
    <View 
      style={{ width: SCREEN_WIDTH, height: SCREEN_HEIGHT }}
      className="bg-black/60 justify-center items-center px-6"
    >
      <View className="w-full bg-white rounded-[35px] p-8 items-center shadow-2xl">
        <View className={`p-5 rounded-[25px] mb-5 ${getIconContainerColor()}`}>
          <Icon name={iconName} size={40} color={colors[type]} />
        </View>
        
        <View className="items-center mb-6">
          <Text className="text-xl font-montserrat-bold text-brand-dark mb-2 text-center">
            {text1}
          </Text>
          <Text className="text-sm font-montserrat text-gray text-center leading-5">
            {text2}
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => Toast.hide()}
          activeOpacity={0.8}
          className={`w-full h-14 rounded-2xl justify-center items-center shadow-md ${getPrimaryBtnColor()}`}
        >
          <Text className="text-white font-montserrat-bold text-base">Close</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export const toastConfig: ToastConfig = {
  success: (props) => (
    <BaseToast
      {...props}
      style={{ borderLeftColor: '#52622E', borderRadius: 12, height: 70 }}
      text1Style={{ fontSize: 15, fontFamily: 'Montserrat-Bold' }}
      text2Style={{ fontSize: 12, fontFamily: 'Montserrat-Regular' }}
    />
  ),
  error: (props) => (
    <ErrorToast
      {...props}
      style={{ borderLeftColor: '#DC3545', borderRadius: 12, height: 70 }}
      text1Style={{ fontSize: 15, fontFamily: 'Montserrat-Bold' }}
      text2Style={{ fontSize: 12, fontFamily: 'Montserrat-Regular' }}
    />
  ),

  modalSuccess: ({ text1, text2 }) => (
    <ModalToast text1={text1} text2={text2} type="success" iconName="checkmark-circle" />
  ),
  modalError: ({ text1, text2 }) => (
    <ModalToast text1={text1} text2={text2} type="error" iconName="alert-circle" />
  ),
  modalInfo: ({ text1, text2 }) => (
    <ModalToast text1={text1} text2={text2} type="info" iconName="information-circle" />
  )
};
