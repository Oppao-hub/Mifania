import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Category } from '../utils/types';
import { ASSET_URL } from '../app/api/client';
import { IMG } from '../utils';

interface CategoryTileProps {
  category: Category;
  imageUri?: string | null;
  onPress: (category: Category) => void;
}

const resolveImageUri = (url?: string | null) => {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  const separator = url.startsWith('/') ? '' : '/';
  return `${ASSET_URL}${separator}${url}`;
};

const CategoryTile: React.FC<CategoryTileProps> = ({ category, imageUri, onPress }) => {
  const source = imageUri
    ? { uri: resolveImageUri(imageUri)! }
    : IMG.LOGO;

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() => onPress(category)}
      className="w-[48%] bg-light-gray rounded-xl mb-3 flex-row items-center overflow-hidden h-[72px]"
    >
      <Text
        className="flex-1 text-sm font-montserrat-bold text-dark-gray pl-3 pr-1"
        numberOfLines={2}
      >
        {category.name}
      </Text>
      <Image
        source={source}
        className="w-[52%] h-full"
        resizeMode="cover"
      />
    </TouchableOpacity>
  );
};

export default CategoryTile;
