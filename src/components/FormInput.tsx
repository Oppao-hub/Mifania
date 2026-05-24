import { View, TextInput, KeyboardTypeOptions, Text } from 'react-native';
import React from 'react';
import Icon from 'react-native-vector-icons/Ionicons';

interface FormInputProps {
  label?: string; // Optional
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  iconName?: string;
  secureTextEntry?: boolean;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  inputClassName?: string;
  editable?: boolean;
  rightElement?: React.ReactNode;
}

const FormInput: React.FC<FormInputProps> = ({
    label,
    value,
    onChangeText,
    placeholder,
    iconName,
    secureTextEntry = false,
    keyboardType = 'default',
    autoCapitalize = 'none',
    inputClassName = '',
    editable = true,
    rightElement,
}) => {
  return (
    <View className="mb-4">
      {/* Label is optional */}
      {label && <Text className="text-sm font-bold text-brand-dark mb-2">{label}</Text>}
      
      {/* Container matches your Register/Login screen input style */}
      <View className={`flex-row items-center bg-white border border-border-color rounded-2xl px-4 h-16 shadow-sm ${inputClassName}`}>
        {iconName && <Icon name={iconName} size={20} color="#6A7282" />}
        
        <TextInput
          className="flex-1 ml-3 text-sm font-bold text-brand-dark h-16"
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#9CA3AF"
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          editable={editable}
        />

        {rightElement && <View>{rightElement}</View>}
      </View>
    </View>
  );
};

export default FormInput;