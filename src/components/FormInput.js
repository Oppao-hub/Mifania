import { View, TextInput,StyleSheet } from 'react-native'
import React from 'react'

const FormInput = ({
    value,
    onChangeText,
    placeholder,
    secureTextEntry = false,
    keyboardType = 'default',
    style,}) => {
  return (
    <View style={styles.container}>
      <TextInput
        style={[styles.input, style]}
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

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  input: {
    height: 50,
    borderRadius: 12,
    paddingHorizontal: 16,
    backgroundColor: '#1e1e1e',
    color: '#fff',
    marginBottom: 16,
  },
});

export default FormInput;