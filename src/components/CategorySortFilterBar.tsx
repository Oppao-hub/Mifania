import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { getThemeColor, surfaceCardShadowStyle } from '../theme';

interface CategorySortFilterBarProps {
  onSortPress: () => void;
  onFilterPress: () => void;
  sortActive?: boolean;
  filterActive?: boolean;
}

const CategorySortFilterBar: React.FC<CategorySortFilterBarProps> = ({
  onSortPress,
  onFilterPress,
  sortActive = false,
  filterActive = false,
}) => {
  const brand = getThemeColor('brand.DEFAULT');

  return (
    <View
      className="flex-row bg-surface rounded-full overflow-hidden self-center"
      style={surfaceCardShadowStyle}
    >
      <TouchableOpacity
        onPress={onSortPress}
        activeOpacity={0.85}
        className="flex-row items-center justify-center px-6 py-3.5 min-w-[130px]"
      >
        <Icon name="swap-vertical" size={18} color={sortActive ? brand : '#4B5563'} />
        <Text
          className={`ml-2 text-sm font-montserrat-bold ${
            sortActive ? 'text-brand' : 'text-dark-gray'
          }`}
        >
          Sort
        </Text>
      </TouchableOpacity>

      <View className="w-px bg-border-color my-2" />

      <TouchableOpacity
        onPress={onFilterPress}
        activeOpacity={0.85}
        className="flex-row items-center justify-center px-6 py-3.5 min-w-[130px]"
      >
        <Icon name="options-outline" size={18} color={filterActive ? brand : '#4B5563'} />
        <Text
          className={`ml-2 text-sm font-montserrat-bold ${
            filterActive ? 'text-brand' : 'text-dark-gray'
          }`}
        >
          Filter
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default CategorySortFilterBar;
