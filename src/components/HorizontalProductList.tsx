import React from 'react';
import { ScrollView } from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { Product } from '../utils/types';
import ProductCard from './ProductCard';

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
        <ProductCard
            key={`horizontal-list-${item.id}`}
            product={item}
            onPress={() => navigation.navigate('ProductDetails', { product: item })}
            containerStyle="w-40 mr-4 mb-0"
        />
      ))}
    </ScrollView>
  );
};

export default HorizontalProductList;
