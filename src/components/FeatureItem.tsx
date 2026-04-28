import { View, Text, TouchableOpacity } from 'react-native';
import React from 'react';
import DynamicIcon from './DynamicIcon';

interface FeatureItemProps {
  name: string;
  iconName: string;
  onPress?: () => void;
}

const FeatureItem: React.FC<FeatureItemProps> = ({ name, iconName, onPress }) => {
  return (
    <TouchableOpacity 
      onPress={onPress} 
      className="items-center mr-6"
      activeOpacity={0.7}
    >
      <View className="w-16 h-16 rounded-full bg-light-gray items-center justify-center mb-2">
        <DynamicIcon name={iconName} size={24} color="#52622E" />
      </View>
      <Text className="text-xs font-montserrat text-dark-gray">{name}</Text>
    </TouchableOpacity>
  )
}

export default FeatureItem;