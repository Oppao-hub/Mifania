import { Text, View } from 'react-native';
import { TextInput } from 'react-native-gesture-handler';

const CustomTextInput = ({
  placeholder,
  label,
  labelStyle,
  value,
  containerStyle,
  textStyle,
  textInputStyle,
}) => {
  return (
    <View style={containerStyle}>
      <Text style={labelStyle}>{label}</Text>
      <TextInput
        placeholder={placeholder}
        placeholderTextColor={ '#e2e2e2' }
        onChangeText={value}
        style={[
          textStyle,
          textInputStyle,
        ]}
      />
    </View>
  );
};

export default CustomTextInput;
