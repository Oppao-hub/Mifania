import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

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
          <Text className="text-brand font-montserrat-bold text-sm">View All →</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default SectionHeader;