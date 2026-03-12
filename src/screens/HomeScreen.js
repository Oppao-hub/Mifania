import React, { useEffect } from 'react';
import { View, Text, FlatList, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';

import ProductCard from '../components/ProductCard';
import { getProducts } from '../app/reducers/product';

const HomeScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();

  const productState = useSelector((state) => state.product || { items: [], isLoading: false, error: null });
  
  const { items, isLoading, error } = productState;

  useEffect(() => {
    dispatch(getProducts());
  }, [dispatch]);

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <View className="flex-1 bg-dashboardBG px-4">
        
        {isLoading && items.length === 0 ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="brand" />
          </View>
        ) : (
          <FlatList
            data={items}
            numColumns={2}
            keyExtractor={(item) => item.id.toString()}
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
                {error && <Text className="text-red-500 mt-2">{error}</Text>}
              </View>
            )}
            renderItem={({ item }) => (
              <ProductCard 
                product={item} 
                onPress={() => navigation.navigate('ProductDetails', { product: item })} 
              />
            )}
            contentContainerStyle={{ paddingBottom: 40 }}
            //Add Pull-to-Refresh
            onRefresh={() => dispatch(getProducts())}
            refreshing={isLoading}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

export default HomeScreen;