import { View, Text, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { IMG } from '../utils';
import ProductCard from '../components/ProductCard';
import React from 'react';

const TOP_PRODUCTS = [
  { id: '1', name: 'Organic Day Dress', price: '1,500', category: 'Dresses', image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8', isNew: true },
  { id: '2', name: 'Denim Dress', price: '1,000', category: 'Dresses', image: 'https://images.unsplash.com/photo-1591369045385-115dd20179d6', isNew: false },
  { id: '3', name: 'Bamboo Tote Bag', price: '800', category: 'Accessories', image: 'https://images.unsplash.com/photo-1590874103328-304371a57b90', isNew: true },
  { id: '4', name: 'Eco Cotton Tee', price: '500', category: 'Men', image: 'https://images.unsplash.com/photo-1504593811423-6dd665756598', isNew: false },
];

const HomeScreen = () => {
  const navigation = useNavigation();
  return (
    <View className="flex-1 bg-dashboardBG px-4">
       <FlatList
        data={TOP_PRODUCTS}
        numColumns={2}
        keyExtractor={(item) => item.id}
        // This ensures the two cards have space between them
        columnWrapperStyle={{ justifyContent: 'space-between' }}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={() => (
          <View className="py-6">
            <Text className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-1">
              Our Products
            </Text>
            <Text className="text-3xl font-bold text-brandDark">
              Top Selling Products
            </Text>
          </View>
        )}
        renderItem={({ item }) => (
          <ProductCard 
            product={item} 
            onPress={() => console.log('Navigating to', item.name)} 
          />
        )}
        // Adds padding to the bottom so the last items aren't cut off
        contentContainerStyle={{ paddingBottom: 40 }}
      />
    </View>
  );
};

export default HomeScreen;