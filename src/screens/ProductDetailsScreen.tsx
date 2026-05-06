import React, { useState } from 'react';
import { 
  View, 
  Text, 
  Image, 
  ScrollView, 
  TouchableOpacity, 
  Dimensions,
  StatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { ASSET_URL } from '../app/api/client';
import Button from '../components/Button';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../app/reducers/cart';
import { toggleWishlist } from '../app/reducers/wishlist';
import { RootState } from '../utils/types';

const { width } = Dimensions.get('window');

export default function ProductDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const dispatch = useDispatch();
  const wishlistItems = useSelector((state: RootState) => state.wishlist.items);
  
  const { product }: any = route.params || {};
  const isWishlisted = wishlistItems.some(item => item.id === product?.id);

  const [selectedSize, setSelectedSize] = useState('L');
  const [selectedColor, setSelectedColor] = useState('Black');
  const [isExpanded, setIsExpanded] = useState(false);

  const sizes = ['XS', 'S', 'M', 'L', 'XL'];
  const colors = [
    { name: 'Black', hex: '#1C1C1C' },
    { name: 'White', hex: '#F9F9F9' },
    { name: 'Brown', hex: '#8B5A2B' },
    { name: 'Blue Grey', hex: '#607B8B' },
    { name: 'Indigo', hex: '#4B0082' },
  ];

  // Map API product fields to display fields
  const displayProduct = {
    id: product?.id,
    name: product?.name || 'Loading...',
    price: product?.price || '0',
    description: product?.description || '',
    image: product?.imageUrl ? `${ASSET_URL}${product.imageUrl}` : (product?.image || ''),
    rating: product?.rating || 0,
    totalReviews: product?.totalReviews || 0,
    sold: product?.sold || '0'
  };

  const handleAddToCart = () => {
    dispatch(addToCart(displayProduct.id, 1));
  };

  const handleToggleWishlist = () => {
    dispatch(toggleWishlist(product));
  };

  // Simulated dynamic reviews data
  const reviews = [
    { 
      id: '1',
      user: 'Elena Richards',
      rating: 5,
      date: '2 days ago',
      comment: 'The quality of the fabric is exceptional. It fits perfectly and feels very premium.',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=100'
    },
    {
      id: '2',
      user: 'Marcus Chen',
      rating: 4,
      date: '1 week ago',
      comment: 'Great design, though the color is slightly darker than the photos. Still love it!',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=100'
    }
  ];

  const formattedPrice = !isNaN(Number(displayProduct.price)) 
    ? Number(displayProduct.price).toFixed(2) 
    : '0.00';

  const DESCRIPTION_LIMIT = 150;
  const shouldTruncate = displayProduct.description.length > DESCRIPTION_LIMIT;
  const displayDescription = isExpanded || !shouldTruncate
    ? displayProduct.description
    : `${displayProduct.description.slice(0, DESCRIPTION_LIMIT)}...`;

  return (
    <SafeAreaView className="flex-1 bg-app-bg" edges={['top']}>
      <StatusBar barStyle="dark-content" />
      
      {/* HEADER */}
      <View className="flex-row items-center justify-between px-4 h-14 bg-app-bg">
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          className="p-2"
        >
          <Icon name="arrow-back" color="#4B5563" size={24} />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-dark-gray">Product Details</Text>
        <View className="flex-row">
          <TouchableOpacity className="p-2">
            <Icon name="share-social-outline" color="#4B5563" size={20} />
          </TouchableOpacity>
          <TouchableOpacity className="p-2">
            <Icon name="ellipsis-vertical" color="#4B5563" size={20} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        
        {/* PRODUCT IMAGE CAROUSEL */}
        <View style={{ width: width, height: width * 1.1 }} className="bg-light-gray relative">
          <Image 
            source={{ uri: displayProduct.image }} 
            className="w-full h-full"
            resizeMode="cover"
          />
          <View className="absolute bottom-5 self-center bg-black/50 px-3 py-1 rounded-full">
            <Text className="text-white text-xs font-bold">1/5</Text>
          </View>
        </View>

        {/* PRODUCT TITLE & PRICE */}
        <View className="p-4 bg-white shadow-sm">
          <Text className="text-xl font-bold text-dark-gray mb-3">{displayProduct.name}</Text>
          <View className="flex-row items-center gap-3">
            <Text className="text-xl font-bold text-brand">${formattedPrice}</Text>
            <View className="flex-row items-center bg-app-bg px-2 py-1 rounded-lg border border-border-color">
              <Text className="text-xs text-gray font-medium">{displayProduct.sold} sold</Text>
            </View>
            <View className="flex-row items-center bg-app-bg px-2 py-1 rounded-lg border border-border-color">
              <Icon name="star" color="#D97706" size={12} />
              <Text className="text-xs text-gray font-medium ml-1">{displayProduct.rating}</Text>
            </View>
          </View>
        </View>

        {/* VOUCHERS */}
        <View className="px-4 mt-6">
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-base font-bold text-dark-gray">Vouchers Available</Text>
            <TouchableOpacity className="flex-row items-center">
              <Text className="text-xs text-brand font-bold">View All</Text>
              <Icon name="chevron-forward" color="#52622E" size={16} />
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="-mx-4 px-4">
            <View className="bg-white border border-dashed border-brand/30 p-3 rounded-xl mr-3 min-w-[200px]">
              <Text className="text-sm font-bold text-dark-gray">Best Deal: 20% OFF</Text>
              <Text className="text-[10px] text-gray mt-1">20ONILS • Min. spend $50</Text>
            </View>
            <View className="bg-white border border-dashed border-brand/30 p-3 rounded-xl mr-3 min-w-[200px]">
              <Text className="text-sm font-bold text-dark-gray">10% OFF</Text>
              <Text className="text-[10px] text-gray mt-1">MIN10 • Min. spend $30</Text>
            </View>
          </ScrollView>
        </View>

        {/* SIZE SELECTOR */}
        <View className="px-4 mt-6">
          <Text className="text-base font-bold text-dark-gray mb-3">Size</Text>
          <View className="flex-row gap-3">
            {sizes.map((size) => (
              <TouchableOpacity 
                key={size} 
                onPress={() => setSelectedSize(size)}
                className={`w-11 h-11 rounded-full border items-center justify-center ${selectedSize === size ? 'bg-brand border-brand' : 'border-border-color bg-white'}`}
              >
                <Text className={`text-sm font-bold ${selectedSize === size ? 'text-white' : 'text-dark-gray'}`}>
                  {size}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* COLOR SELECTOR */}
        <View className="px-4 mt-6">
          <Text className="text-base font-bold text-dark-gray mb-3">Color</Text>
          <View className="flex-row gap-3">
            {colors.map((color) => (
              <TouchableOpacity 
                key={color.name} 
                onPress={() => setSelectedColor(color.name)}
                className={`w-11 h-11 rounded-full border items-center justify-center ${selectedColor === color.name ? 'border-dark-gray' : 'border-transparent'}`}
              >
                <View 
                  style={{ backgroundColor: color.hex }} 
                  className="w-9 h-9 rounded-full border border-border-color" 
                />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* PRODUCT INFORMATION */}
        <View className="px-4 mt-6">
          <Text className="text-base font-bold text-dark-gray mb-3">Product Information</Text>
          <View className="mb-4">
            <View className="flex-row mb-2">
              <Text className="flex-1 text-sm text-gray">Material</Text>
              <Text className="flex-[2] text-sm text-dark-gray font-bold">: 100% Acrylic</Text>
            </View>
            <View className="flex-row mb-2">
              <Text className="flex-1 text-sm text-gray">Care Label</Text>
              <Text className="flex-[2] text-sm text-dark-gray font-bold">: Machine Washable</Text>
            </View>
            <View className="flex-row mb-2">
              <Text className="flex-1 text-sm text-gray">SKU</Text>
              <Text className="flex-[2] text-sm text-dark-gray font-bold">: UBL-SS-S5-C6-246</Text>
            </View>
          </View>
          <TouchableOpacity onPress={() => setIsExpanded(!isExpanded)} activeOpacity={0.7}>
            <Text className="text-sm text-gray leading-5">
              {displayDescription}{' '}
              {shouldTruncate && (
                <Text className="text-brand font-bold">
                  {isExpanded ? 'read less' : 'read more...'}
                </Text>
              )}
            </Text>
          </TouchableOpacity>
        </View>

        {/* RATINGS & REVIEWS */}
        <View className="px-4 mt-8">
          <View className="flex-row justify-between items-center mb-4">
            <View>
              <Text className="text-base font-bold text-dark-gray">Ratings & Reviews</Text>
              <View className="flex-row items-center mt-1">
                <Icon name="star" color="#D97706" size={14} />
                <Text className="text-sm font-bold text-dark-gray ml-1">{displayProduct.rating}</Text>
                <Text className="text-xs text-gray ml-1">({displayProduct.totalReviews} reviews)</Text>
              </View>
            </View>
            <TouchableOpacity className="flex-row items-center bg-brand/10 px-3 py-2 rounded-full">
              <Text className="text-xs text-brand font-bold">View All</Text>
              <Icon name="chevron-forward" color="#52622E" size={14} />
            </TouchableOpacity>
          </View>

          {/* Individual Reviews */}
          <View className="gap-4">
            {reviews.map((review) => (
              <View key={review.id} className="bg-white p-4 rounded-2xl border border-border-color shadow-sm">
                <View className="flex-row justify-between items-start mb-2">
                  <View className="flex-row items-center">
                    <Image source={{ uri: review.avatar }} className="w-8 h-8 rounded-full bg-light-gray" />
                    <View className="ml-3">
                      <Text className="text-sm font-bold text-dark-gray">{review.user}</Text>
                      <View className="flex-row items-center">
                        {[...Array(5)].map((_, i) => (
                          <Icon 
                            key={i} 
                            name={i < review.rating ? "star" : "star-outline"} 
                            color={i < review.rating ? "#D97706" : "#E5E7EB"} 
                            size={10} 
                          />
                        ))}
                        <Text className="text-[10px] text-gray ml-2">{review.date}</Text>
                      </View>
                    </View>
                  </View>
                </View>
                <Text className="text-sm text-gray leading-5">{review.comment}</Text>
              </View>
            ))}
          </View>
        </View>

      </ScrollView>

      {/* BOTTOM ACTION BAR */}
      <View className="absolute bottom-0 left-0 right-0 bg-white flex-row p-4 pb-8 border-t border-border-color gap-3 items-center">
        <TouchableOpacity 
          className="w-12 h-12 rounded-full border border-border-color items-center justify-center"
          onPress={handleToggleWishlist}
        >
          <Icon name={isWishlisted ? "heart" : "heart-outline"} color={isWishlisted ? "#DC3545" : "#4B5563"} size={24} />
        </TouchableOpacity>
        
        <View className="flex-1">
          <Button 
            label="Buy Now" 
            variant="ghost"
            onPress={() => console.log('Buy Now')}
            className="h-12 px-2 bg-brand/10 border border-brand/20"
            textClassName="text-brand text-[12px] font-bold"
          />
        </View>

        <View className="flex-1">
          <Button 
            label="Add to Cart" 
            onPress={handleAddToCart}
            className="h-12 px-2 shadow-lg bg-brand"
            textClassName="text-[12px] font-bold"
          />
        </View>
      </View>
    </SafeAreaView>
  );
}
