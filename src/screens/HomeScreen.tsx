import React, { useEffect, useState } from 'react';
import { View, FlatList, ActivityIndicator, Text } from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';

import { RootState } from '../types';
import HomeHeader from '../components/HeaderComponent';
import SectionHeader from '../components/SectionHeader';
import ProductCard from '../components/ProductCard';
import CategoriesList from '../components/CategoriesList';
import HorizontalProductList from '../components/HorizontalProductList';
import { getProducts } from '../app/reducers/product';
import { getCategories } from '../app/reducers/category';
import { ASSET_URL } from '../app/api/client';

const HomeScreen = () => {
  const navigation = useNavigation<NavigationProp<any>>();
  const dispatch = useDispatch();
  const [searchQuery, setSearchQuery] = useState('');
  
  const { items, isLoading: isProductsLoading } = useSelector((state: RootState) => state.product);
  const { items: categories, isLoading: isCategoriesLoading } = useSelector((state: RootState) => state.category);

  useEffect(() => {
    dispatch(getProducts());
    dispatch(getCategories());
  }, [dispatch]);

  const trendingProducts = items.slice(0, 5);

  const renderHeader = () => (
    <View className="mb-4">
      {/* Categories Section */}
      <SectionHeader title="Categories" />
      <CategoriesList 
        categories={categories} 
        isLoading={isCategoriesLoading} 
        onCategoryPress={(category) => console.log('Category pressed:', category.name)}
      />

      {/* Trending Products Section */}
      <SectionHeader title="Trending Products" onPress={() => console.log('See all trending')} />
      <HorizontalProductList products={trendingProducts} />

      {/* New Arrivals Section */}
      <SectionHeader title="New Arrivals" />
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-app-bg" edges={['top']}>
      <HomeHeader searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

      <View className="flex-1 px-4">
        {isProductsLoading && items.length === 0 ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#52622E" />
          </View>
        ) : (
          <FlatList
            data={items}
            numColumns={2}
            keyExtractor={(item) => item.id.toString()}
            columnWrapperStyle={{ justifyContent: 'space-between' }}
            contentContainerStyle={{ paddingBottom: 100 }}
            ListHeaderComponent={renderHeader}
            renderItem={({ item }) => (
              <ProductCard
                productName={item.name}
                productImage={`${ASSET_URL}${item.imageUrl}`}
                onPress={() => navigation.navigate('ProductDetails', { product: item })}
              />
            )}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              !isProductsLoading ? (
                <View className="items-center mt-10">
                  <Text className="text-gray font-montserrat">No products found</Text>
                </View>
              ) : null
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
};

export default HomeScreen;