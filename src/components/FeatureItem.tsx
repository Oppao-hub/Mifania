import { View, Text, TouchableOpacity } from 'react-native';
import React from 'react';
import Icon from 'react-native-vector-icons/Ionicons';

interface FeatureItemProps {
  name: string;
  onPress?: () => void;
}

const FeatureItem: React.FC<FeatureItemProps> = ({ name, onPress }) => {
  return (
    <TouchableOpacity 
      onPress={onPress} 
      className="items-center mr-6"
      activeOpacity={0.7}
    >
      <Text className="text-xs font-montserrat text-dark-gray">{name}</Text>
    </TouchableOpacity>
  )
}

export default FeatureItem;