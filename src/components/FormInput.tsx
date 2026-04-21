import { View, TextInput, KeyboardTypeOptions } from 'react-native'
import React from 'react'

interface FormInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  secureTextEntry?: boolean;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  inputClassName?: string;
}

const FormInput: React.FC<FormInputProps> = ({
    value,
    onChangeText,
    placeholder,
    secureTextEntry = false,
    keyboardType = 'default',
    autoCapitalize = 'none',
    inputClassName = '',
}) => {
  return (
    <View>
      <TextInput
        className={`w-full bg-white h-12 rounded-xl px-4 mb-4 border border-light-gray ${inputClassName}`}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#999"
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
      />
    </View>
  )
}

export default FormInput;