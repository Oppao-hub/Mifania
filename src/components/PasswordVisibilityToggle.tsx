import React from 'react';
import { TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

type PasswordVisibilityToggleProps = {
  visible: boolean;
  onToggle: () => void;
};

const PasswordVisibilityToggle: React.FC<PasswordVisibilityToggleProps> = ({ visible, onToggle }) => (
  <TouchableOpacity onPress={onToggle} activeOpacity={0.7} className="p-1">
    <Icon name={visible ? 'eye-off-outline' : 'eye-outline'} size={20} color="#6A7282" />
  </TouchableOpacity>
);

export default PasswordVisibilityToggle;
