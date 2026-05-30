import React from 'react';
import { View, Text } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

type FormFieldErrorTone = 'error' | 'warning';

interface FormFieldErrorProps {
  message?: string | null;
  /** banner = alert card above fields; inline = compact text under a field */
  variant?: 'banner' | 'inline';
  tone?: FormFieldErrorTone;
  className?: string;
}

const toneConfig: Record<
  FormFieldErrorTone,
  { container: string; icon: string; iconColor: string; iconBg: string; text: string }
> = {
  error: {
    container: 'bg-[#FEF2F2] border-danger/20',
    icon: 'alert-circle-outline',
    iconColor: '#DC3545',
    iconBg: 'bg-danger/10',
    text: 'text-danger',
  },
  warning: {
    container: 'bg-[#FFFBEB] border-warning/25',
    icon: 'warning-outline',
    iconColor: '#D97706',
    iconBg: 'bg-warning/15',
    text: 'text-warning',
  },
};

const FormFieldError: React.FC<FormFieldErrorProps> = ({
  message,
  variant = 'banner',
  tone = 'error',
  className = '',
}) => {
  if (!message) {
    return null;
  }

  const config = toneConfig[tone];

  if (variant === 'inline') {
    return (
      <Text className={`text-xs font-montserrat-medium text-danger ml-1 mt-1 ${className}`}>
        {message}
      </Text>
    );
  }

  return (
    <View
      className={`w-full flex-row items-center rounded-2xl border px-3 py-2 ${config.container} ${className}`}
    >
      <View
        className={`mr-3 h-10 w-10 shrink-0 items-center justify-center rounded-full ${config.iconBg}`}
      >
        <Icon name={config.icon} size={20} color={config.iconColor} />
      </View>

      <View className="min-h-[40px] flex-1 justify-center">
        <Text
          className={`text-left text-sm font-montserrat leading-5 ${config.text}`}
          style={{ textAlign: 'left' }}
        >
          {message}
        </Text>
      </View>
    </View>
  );
};

export default FormFieldError;
