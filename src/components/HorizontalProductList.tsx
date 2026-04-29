import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { Product } from '../types';
import { ASSET_URL } from '../app/api/client';

interface HorizontalProductListProps {
  products: Product[];
}

const HorizontalProductList: React.FC<HorizontalProductListProps> = ({ products }) => {
  const navigation = useNavigation<NavigationProp<any>>();

  return (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      style={{ marginHorizontal: -16 }} // Expands scroll area to screen edges
      contentContainerStyle={{ 
        paddingBottom: 10,
        paddingHorizontal: 16 // Re-aligns items with screen padding
      }}
    >
      {products.map((item) => (
        <TouchableOpacity 
          key={`horizontal-list-${item.id}`}
          className="bg-light-gray rounded-2xl overflow-hidden mr-4 w-40 shadow-sm"
          onPress={() => navigation.navigate('ProductDetails', { product: item })}
          activeOpacity={0.8}
        >
          <View className="w-full aspect-square bg-gray-100">
            <Image 
              source={{ uri: `${ASSET_URL}${item.imageUrl}` }} 
              className="w-full h-full"
              resizeMode="cover"
            />
          </View>
          <View className="py-2 px-2">
            <Text className="text-xs font-montserrat-bold text-brand" numberOfLines={1}>
              {item.name}
            </Text>
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

export default HorizontalProductList;