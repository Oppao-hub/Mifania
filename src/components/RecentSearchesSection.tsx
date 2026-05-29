import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

interface RecentSearchesSectionProps {
  items: string[];
  onSelect: (query: string) => void;
  onRemove: (query: string) => void;
  onClearAll: () => void;
}

const RecentSearchesSection: React.FC<RecentSearchesSectionProps> = ({
  items,
  onSelect,
  onRemove,
  onClearAll,
}) => {
  if (items.length === 0) return null;

  return (
    <View className="px-4 mt-2">
      <View className="flex-row justify-between items-center mb-2">
        <Text className="text-base font-montserrat-bold text-dark-gray">Recent Searches</Text>
        <TouchableOpacity onPress={onClearAll} hitSlop={12}>
          <Icon name="close" size={20} color="#6A7282" />
        </TouchableOpacity>
      </View>

      {items.map((term) => (
        <View
          key={term}
          className="flex-row items-center justify-between py-3 border-b border-border-color"
        >
          <TouchableOpacity
            className="flex-1 flex-row items-center"
            onPress={() => onSelect(term)}
            activeOpacity={0.7}
          >
            <Icon name="time-outline" size={18} color="#9CA3AF" />
            <Text className="ml-3 text-sm font-montserrat text-dark-gray">{term}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => onRemove(term)} hitSlop={12}>
            <Icon name="close" size={18} color="#9CA3AF" />
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );
};

export default RecentSearchesSection;
