import React from 'react';
import { Dimensions, Text, TouchableOpacity, View, ViewStyle, TextStyle } from 'react-native';

interface CustomButtonProps {
    label: string;
    onPress: () => void;
    buttonStyle?: ViewStyle;
    buttonTextStyle?: TextStyle;
}

const CustomButton: React.FC<CustomButtonProps> = ({ label, onPress, buttonStyle, buttonTextStyle }) => {
  const { width } = Dimensions.get('window');
  return (
    <View>
      <TouchableOpacity
        onPress={onPress}
        style={ buttonStyle }
      >
        <View style={{ padding: width * 0.02 }}>
          <Text
            style={buttonTextStyle}
          >
            {label}
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default CustomButton;
