import React from 'react';
import { View, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { RootState } from '../utils/types';
import ProductCard from '../components/ProductCard';
import Header from '../components/Header';
import EmptyState from '../components/EmptyState';

const WishlistScreen = () => {
  const navigation = useNavigation<NavigationProp<any>>();
  const wishlistItems = useSelector((state: RootState) => state.wishlist.items);

  return (
    <SafeAreaView className="flex-1 bg-app-bg" edges={['top']}>
      <Header title="Wishlist" />

      <View className="flex-1 px-4">
        {wishlistItems.length > 0 ? (
          <FlatList
            data={wishlistItems}
            numColumns={2}
            keyExtractor={(item) => item.id.toString()}
            columnWrapperStyle={{ justifyContent: 'space-between' }}
            contentContainerStyle={{ paddingBottom: 100, paddingTop: 10 }}
            renderItem={({ item }) => (
              <ProductCard
                product={item}
                onPress={() => navigation.navigate('ProductDetails', { product: item })}
              />
            )}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <EmptyState 
            iconName="heart-outline"
            title="Your wishlist is empty"
            description="Save items you love here to find them easily later."
            buttonText="Explore Products"
            onButtonPress={() => navigation.navigate('Home' as never)}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

export default WishlistScreen;
