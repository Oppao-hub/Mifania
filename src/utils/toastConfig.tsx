import React from 'react';
import { View, Text, TouchableOpacity, Dimensions } from 'react-native';
import { BaseToast, ErrorToast, ToastConfig } from 'react-native-toast-message';
import Icon from 'react-native-vector-icons/Ionicons';
import Toast from 'react-native-toast-message';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const TITLE_CLASS = 'w-full text-xl font-montserrat-bold text-brand-dark text-center';
const TITLE_INNER_CLASS = 'text-xl font-montserrat-bold text-brand-dark';

/** Custom Montserrat builds often clip text after "&" unless it is nested. */
const ModalTitle = ({ title }: { title: string }) => (
  <Text className={`${TITLE_CLASS} mb-2`} style={{ flexShrink: 1 }}>
    {!title.includes('&') ? (
      title
    ) : (
      title.split('&').map((segment, index) => (
        <React.Fragment key={`${index}-${segment}`}>
          {index > 0 ? <Text className={TITLE_INNER_CLASS}>&</Text> : null}
          {segment}
        </React.Fragment>
      ))
    )}
  </Text>
);

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
      <View className="w-full bg-white rounded-[35px] p-8 shadow-2xl">
        <View className={`self-center p-5 rounded-[25px] mb-5 ${getIconContainerColor()}`}>
          <Icon name={iconName} size={40} color={colors[type]} />
        </View>

        <View className="w-full mb-6 px-1">
          {text1 ? <ModalTitle title={text1} /> : null}
          {text2 ? (
            <Text className="w-full text-sm font-montserrat text-gray text-center leading-5">
              {text2}
            </Text>
          ) : null}
        </View>

        <TouchableOpacity
          onPress={() => Toast.hide()}
          activeOpacity={0.8}
          className={`self-stretch h-14 rounded-2xl justify-center items-center shadow-md ${getPrimaryBtnColor()}`}
        >
          <Text className="text-white font-montserrat-bold text-base">Close</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const FeedbackToast = ({
  text1,
  variant,
}: {
  text1?: string;
  variant: 'success' | 'error';
}) => {
  const iconColor = variant === 'success' ? '#52622E' : '#DC3545';

  return (
    <View
      className="mx-6 flex-row items-center rounded-2xl border border-border-color bg-white px-4 py-3.5 shadow-lg"
      style={{
        width: SCREEN_WIDTH - 48,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 12,
        elevation: 8,
      }}
    >
      <View
        className="mr-3 h-9 w-9 items-center justify-center rounded-full"
        style={{ backgroundColor: variant === 'success' ? '#52622E' : '#FEE2E2' }}
      >
        <Icon
          name={variant === 'success' ? 'checkmark' : 'close'}
          size={20}
          color={variant === 'success' ? '#FFFFFF' : iconColor}
        />
      </View>
      <Text className="flex-1 font-montserrat-bold text-base text-dark-gray">{text1}</Text>
    </View>
  );
};

export const toastConfig: ToastConfig = {
  feedbackSuccess: ({ text1 }) => <FeedbackToast text1={text1} variant="success" />,
  feedbackError: ({ text1 }) => <FeedbackToast text1={text1} variant="error" />,

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
