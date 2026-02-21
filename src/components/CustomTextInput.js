import { Text, View } from 'react-native';
import { TextInput } from 'react-native-gesture-handler';

const CustomTextInput = ({
  placeholder,
  placeholderStyle,
  label,
  labelStyle,
  value,
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
        onChangeText={value}
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
