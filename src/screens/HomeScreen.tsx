import React, { useEffect, useState } from 'react';
import { View, FlatList, ActivityIndicator, Text } from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';

import { RootState } from '../utils/types';
import Header from '../components/Header';
import SectionHeader from '../components/SectionHeader';
import ProductCard from '../components/ProductCard';
import CategoriesList from '../components/CategoriesList';
import HorizontalProductList from '../components/HorizontalProductList';
import { getProducts } from '../app/reducers/product';
import { getCategories } from '../app/reducers/category';
import { getSubCategories } from '../app/reducers/subCategory';
import { ASSET_URL } from '../app/api/client';

const HomeScreen = () => {
  const navigation = useNavigation<NavigationProp<any>>();
  const dispatch = useDispatch();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | string | null>('all');
  const [selectedSubCategoryId, setSelectedSubCategoryId] = useState<number | string | null>(null);
  
  const { items, isLoading: isProductsLoading } = useSelector((state: RootState) => state.product);
  const { items: categories, isLoading: isCategoriesLoading } = useSelector((state: RootState) => state.category);
  const { items: subCategories, isLoading: isSubCategoriesLoading } = useSelector((state: RootState) => state.subCategory);

  useEffect(() => {
    dispatch(getProducts());
    dispatch(getCategories());
    dispatch(getSubCategories());
  }, [dispatch]);

  // Combine "All" with categories from API
  const allCategories = [{ id: 'all', name: 'All' }, ...categories];

  // Filter subcategories based on the selected parent category
  const activeSubCategories = selectedCategoryId && selectedCategoryId !== 'all' 
    ? subCategories.filter(sub => sub.category.id === selectedCategoryId)
    : [];

  // Reset subcategory when category changes
  const handleCategoryPress = (category: any) => {
    setSelectedCategoryId(category.id);
    setSelectedSubCategoryId(null); // Reset sub-filter when parent changes
  };

  // Filter products based on selected category, subcategory, and search query
  const filteredProducts = items.filter((product) => {
    // 1. Get the subcategory object for this product from the state
    const productSubCat = subCategories.find(sc => `/api/sub_categories/${sc.id}` === product.subCategory);

    // 2. Category Filter: Match the parent category of the product's subcategory
    const matchesCategory = !selectedCategoryId || selectedCategoryId === 'all' || 
                           productSubCat?.category.id === selectedCategoryId;

    // 3. SubCategory Filter: Match the subcategory ID directly
    const matchesSubCategory = !selectedSubCategoryId || productSubCat?.id === selectedSubCategoryId;

    // 4. Search Filter
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSubCategory && matchesSearch;
  });

  console.log('Total Products:', items.length);
  console.log('Filtered Products:', filteredProducts.length);
  if (items.length > 0 && filteredProducts.length === 0) {
    console.log('Filter debug - selectedCategoryId:', selectedCategoryId, 'selectedSubCategoryId:', selectedSubCategoryId);
  }

  const trendingProducts = items.slice(0, 5);

  const renderHeader = () => (
    <View className="mb-4">
      {/* Trending Products Section */}
      <SectionHeader title="Trending Products" onPress={() => console.log('See all trending')} />
      <HorizontalProductList products={trendingProducts} />

      {/* New Arrivals Section */}
      <SectionHeader title="New Arrivals" />
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-app-bg" edges={['top']}>
      <Header 
        isHome
        showSearch
        searchQuery={searchQuery} 
        setSearchQuery={setSearchQuery}
        categories={allCategories}
        isCategoriesLoading={isCategoriesLoading}
        activeCategoryId={selectedCategoryId}
        onCategoryPress={handleCategoryPress}
        subCategories={activeSubCategories}
        isSubCategoriesLoading={isSubCategoriesLoading}
        activeSubCategoryId={selectedSubCategoryId}
        onSubCategoryPress={(sub) => setSelectedSubCategoryId(sub.id)}
      />

      <View className="flex-1 px-4">
        {isProductsLoading && items.length === 0 ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#52622E" />
          </View>
        ) : (
          <FlatList
            data={filteredProducts}
            numColumns={2}
            keyExtractor={(item) => item.id.toString()}
            columnWrapperStyle={{ justifyContent: 'space-between' }}
            contentContainerStyle={{ paddingBottom: 100 }}
            ListHeaderComponent={renderHeader}
            renderItem={({ item }) => (
              <ProductCard
                product={item}
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