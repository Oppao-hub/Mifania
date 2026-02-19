import { Dimensions, Text, TouchableOpacity, View } from 'react-native';

const CustomButton = ({ label, onPress }) => {

  const { width, height } = Dimensions.get('window');
  return (
    <View>
      <TouchableOpacity
        onPress={onPress}
        style={{
          margin: 10,
          backgroundColor: 'blue',
          borderRadius: 10,
        }}
      >
        <View style={{ padding: width * 0.02 }}>
          <Text
            style={{
              color: 'white',
              fontSize: 15,
            }}
          >
            {label}
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default CustomButton;
