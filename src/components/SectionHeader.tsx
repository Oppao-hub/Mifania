import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

interface SectionHeaderProps {
  title: string;
  onPress?: () => void;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({ title, onPress }) => {
  return (
    <View className="flex-row justify-between items-center mb-4 mt-6">
      <Text className="text-xl font-montserrat-bold text-dark-gray">{title}</Text>
      {onPress && (
        <TouchableOpacity onPress={onPress} className="flex-row items-center">
          <Text className="text-brand mr-1 font-montserrat">See All</Text>
          <Icon name="chevron-forward" size={16} color="#52622E" />
        </TouchableOpacity>
      )}
    </View>
  );
};

export default SectionHeader;