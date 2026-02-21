import { View, TextInput } from 'react-native'
import React from 'react'

const FormInput = ({
    value,
    onChangeText,
    placeholder,
    secureTextEntry = false,
    keyboardType = 'default',
    className, // Use this for the container (margins, width)
    inputClassName, // Use this for the actual input (colors, borders)
}) => {
  return (
    <View>
      <TextInput
        // The TextInput handles the internal "box" styling
        className={`w-full bg-white h-12 rounded-xl px-4 mb-4 border border-light-gray ${inputClassName}`}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#999"
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
      />
    </View>
  )
}

export default FormInput;