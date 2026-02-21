import React, { useState } from 'react'
import { View, TextInput, TouchableOpacity } from 'react-native'
import Icon from 'react-native-vector-icons/Ionicons'

const PasswordInput = ({ value, onChangeText, placeholder }) => {
  const [isPasswordHidden, setIsPasswordHidden] = useState(true)

  return (
    <View className="relative w-full mb-5">
      <TextInput
        placeholder={placeholder || "Enter your password"}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={isPasswordHidden}
        className="w-full bg-white h-12 rounded-xl px-4 border border-light-gray"
        placeholderTextColor="#9CA3AF"
      />

      <TouchableOpacity
        onPress={() => setIsPasswordHidden(!isPasswordHidden)}
        className="absolute right-5 top-1/2 -translate-y-1/2"
      >
        <Icon
          name={isPasswordHidden ? 'eye' : 'eye-off'}
          size={22}
          color="#6B7280"
        />
      </TouchableOpacity>
    </View>
  )
}

export default PasswordInput