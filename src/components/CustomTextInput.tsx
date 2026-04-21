import React from 'react';
import { Text, View, TextInput, ViewStyle, TextStyle } from 'react-native';

interface CustomTextInputProps {
  placeholder?: string;
  placeholderStyle?: string;
  label: string;
  labelStyle?: TextStyle;
  value: string;
  onChangeText?: (text: string) => void;
  containerStyle?: ViewStyle;
  textStyle?: TextStyle;
  textInputStyle?: TextStyle;
  secureTextEntry?: boolean;
}

const CustomTextInput: React.FC<CustomTextInputProps> = ({
  placeholder,
  placeholderStyle,
  label,
  labelStyle,
  value,
  onChangeText,
  containerStyle,
  textStyle,
  textInputStyle,
  secureTextEntry,
}) => {
  return (
    <View style={containerStyle}>
      <Text style={labelStyle}>{label}</Text>
      <TextInput
        placeholder={placeholder}
        placeholderTextColor={placeholderStyle}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        style={[
          textStyle,
          textInputStyle,
        ]}
      />
    </View>
  );
};

export default CustomTextInput;
