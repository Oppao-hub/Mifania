import { View, Text, ImageBackground } from 'react-native';
import React, { useState } from 'react';
import { styled } from 'nativewind';
import IMG from '../utls';

const Register = () => {
  return (
    <ImageBackground 
      source={ {uri:IMG.REGISTER_BG} }
    >
      <View>
        <Text>Register</Text>
      </View>
    </ImageBackground> 
  )
}
export default Register