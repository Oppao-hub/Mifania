import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { getThemeColor } from '../theme';

interface HomePromoBannerProps {
  title?: string;
  subtitle?: string;
  description?: string;
  onPress?: () => void;
  imageUri?: string | null;
}

const HomePromoBanner: React.FC<HomePromoBannerProps> = ({
  title = '30% OFF',
  subtitle = "Today's Special!",
  description = 'Get discount on select orders — tap to view promos & vouchers',
  onPress,
  imageUri,
}) => {
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      disabled={!onPress}
      className="rounded-2xl overflow-hidden bg-brand min-h-[140px] flex-row"
    >
      <View className="flex-1 py-5 pl-5 pr-2 justify-center">
        <Text className="text-3xl font-montserrat-bold text-white">{title}</Text>
        <Text className="text-base font-montserrat-bold text-white mt-1">{subtitle}</Text>
        <Text className="text-xs font-montserrat text-white/85 mt-2 leading-4" numberOfLines={2}>
          {description}
        </Text>
        {onPress ? (
          <View className="flex-row items-center mt-3">
            <Text className="text-xs font-montserrat-bold text-white mr-1">View offers</Text>
            <Icon name="arrow-forward" size={14} color="#FFFFFF" />
          </View>
        ) : null}
      </View>

      <View className="w-[42%] justify-end items-center relative">
        <View
          className="absolute -right-6 top-4 w-28 h-28 rounded-full opacity-20"
          style={{ backgroundColor: getThemeColor('brand.light') }}
        />
        <View
          className="absolute right-2 bottom-6 w-20 h-20 rounded-full opacity-15"
          style={{ backgroundColor: '#FFFFFF' }}
        />
        {imageUri ? (
          <Image
            source={{ uri: imageUri }}
            className="w-full h-[150px] -mr-2"
            resizeMode="contain"
          />
        ) : (
          <View className="w-24 h-24 rounded-full bg-white/15 items-center justify-center mb-4 mr-2">
            <Icon name="leaf-outline" size={40} color="#FFFFFF" />
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

export default HomePromoBanner;
