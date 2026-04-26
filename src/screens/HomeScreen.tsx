import React, { useEffect } from 'react';
import { View, FlatList, ActivityIndicator } from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';

import { IMG } from '../utils';
import { RootState } from '../types';

import ProductCard from '../components/ProductCard';
import { getProducts } from '../app/reducers/product';

const HomeScreen = () => {
  const navigation = useNavigation<NavigationProp<any>>();
  const dispatch = useDispatch();
  const { items, isLoading } = useSelector((state: RootState) => state.product);

  useEffect(() => {
    dispatch(getProducts());
  }, [dispatch]);

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <View className="flex-1 bg-dashboardBG px-4">
        <FlatList
          data={items}
          numColumns={2}
          keyExtractor={(item) => item.id.toString()}
          columnWrapperStyle={{ justifyContent: 'space-between' }}
          contentContainerStyle={{ paddingBottom: 100 }} // Added padding for floating nav bar
          renderItem={({ item }) => (
            <ProductCard
              productName={item.name}
              productImage={item.image}
              onPress={() => navigation.navigate('ProductDetails', { product: item })}
            />
          )}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </SafeAreaView>
  );
};

export default HomeScreen;