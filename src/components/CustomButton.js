import { Dimensions, Text, TouchableOpacity, View } from 'react-native';

const CustomButton = ({ label, onPress, buttonStyle, buttonTextStyle }) => {

  const { width, height } = Dimensions.get('window');
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
