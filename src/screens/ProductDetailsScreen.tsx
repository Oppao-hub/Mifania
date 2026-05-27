import React, { useState, useEffect } from 'react';
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
import Toast from 'react-native-toast-message';
import { ASSET_URL } from '../app/api/client';
import Button from '../components/Button';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../app/reducers/cart';
import { toggleWishlist } from '../app/reducers/wishlist';
import { RootState } from '../utils/types';
import { ROUTES } from '../utils';

const { width } = Dimensions.get('window');

export default function ProductDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const dispatch = useDispatch();
  const wishlistItems = useSelector((state: RootState) => state.wishlist.items);
  const { isLoading: isCartLoading, error: cartError } = useSelector((state: RootState) => state.cart);
  
  const { product }: any = route.params || {};
  const isWishlisted = wishlistItems.some(item => item.id === product?.id);

  const [selectedSize, setSelectedSize] = useState('L');
  const [selectedColor, setSelectedColor] = useState('Black');
  const [isExpanded, setIsExpanded] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  const sizes = ['XS', 'S', 'M', 'L', 'XL'];
  const colors = [
    { name: 'Black', hex: '#1C1C1C' },
    { name: 'White', hex: '#F9F9F9' },
    { name: 'Brown', hex: '#8B5A2B' },
    { name: 'Blue Grey', hex: '#607B8B' },
    { name: 'Indigo', hex: '#4B0082' },
  ];

  const getImageUrl = (url?: string) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    const separator = url.startsWith('/') ? '' : '/';
    return `${ASSET_URL}${separator}${url}`;
  };

  const displayProduct = {
    id: product?.id,
    name: product?.name || 'Loading...',
    price: product?.price || '0',
    description: product?.description || '',
    image: product?.imageUrl ? getImageUrl(product.imageUrl) : getImageUrl(product?.image),
    stock: parseInt(product?.stock || '0', 10),
    qrTag: product?.qrTag ? getImageUrl(typeof product.qrTag === 'object' ? product.qrTag.image : product.qrTag) : null,
    material: product?.material || 'Not specified', // 💡 NEW: Linked to actual backend property
  };

  const isOutOfStock = displayProduct.stock <= 0;
  const isLowStock = displayProduct.stock > 0 && displayProduct.stock <= 5;

  // Handle Cart Success/Error
  useEffect(() => {
    if (isAddingToCart && !isCartLoading) {
      if (cartError) {
        Toast.show({
          type: 'modalError',
          text1: 'Oops!',
          text2: cartError,
        });
      } else {
        Toast.show({
          type: 'modalSuccess',
          text1: 'Success!',
          text2: `${displayProduct.name} has been added to your cart.`,
        });
      }
      setIsAddingToCart(false);
    }
  }, [isCartLoading, cartError, isAddingToCart, displayProduct.name]);

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    setIsAddingToCart(true);
    dispatch(addToCart(displayProduct.id, 1));
  };

  const handleBuyNow = () => {
    if (isOutOfStock) return;
    dispatch(addToCart(displayProduct.id, 1));
    navigation.navigate(ROUTES.CART as never);
  };

  const handleToggleWishlist = () => {
    dispatch(toggleWishlist(product));
  };

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
          onPress={() => {
            if (navigation.canGoBack()) {
              navigation.goBack();
            } else {
              navigation.navigate('HomeTab' as never);
            }
          }}
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
            source={{ uri: displayProduct.image || '' }} 
            className="w-full h-full"
            resizeMode="cover"
          />
          <View className="absolute bottom-5 self-center bg-black/50 px-3 py-1 rounded-full">
            <Text className="text-white text-xs font-bold">1/5</Text>
          </View>
          
          {/* Embedded QR Tag */}
          {displayProduct.qrTag && (
            <View className="absolute bottom-5 right-4 bg-white p-1.5 rounded-xl shadow-lg border border-gray-100">
              <Image 
                source={{ uri: displayProduct.qrTag }} 
                className="w-14 h-14"
                resizeMode="cover"
              />
            </View>
          )}
        </View>

        {/* PRODUCT TITLE & PRICE */}
        <View className="p-4 bg-white shadow-sm">
          <Text className="text-xl font-bold text-dark-gray mb-3">{displayProduct.name}</Text>
          <View className="flex-row items-center gap-3">
            <Text className="text-xl font-bold text-brand">₱{formattedPrice}</Text>
            {/* 💡 REMOVED 'sold' UI element from here */}
          </View>

          {/* Dynamic Stock Display */}
          <View className="mt-3">
            {isOutOfStock ? (
              <Text className="text-sm font-bold text-red-500">Out of Stock</Text>
            ) : isLowStock ? (
              <Text className="text-sm font-bold text-orange-500">Low on Stock: Only {displayProduct.stock} left!</Text>
            ) : (
              <Text className="text-sm font-bold text-green-600">In Stock</Text>
            )}
          </View>
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
              {/* 💡 LINKED dynamic material from backend */}
              <Text className="flex-[2] text-sm text-dark-gray font-bold">: {displayProduct.material}</Text>
            </View>
            {/* 💡 REMOVED Care Label and SKU rows */}
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
            label={isOutOfStock ? "Unavailable" : "Buy Now"} 
            variant="ghost"
            disabled={isOutOfStock}
            onPress={handleBuyNow}
            className={`h-12 px-2 border ${isOutOfStock ? 'bg-gray-100 border-gray-300' : 'bg-brand/10 border-brand/20'}`}
            textClassName={`text-[12px] font-bold ${isOutOfStock ? 'text-gray-400' : 'text-brand'}`}
          />
        </View>

        <View className="flex-1">
          <Button 
            label={isOutOfStock ? "Unavailable" : "Add to Cart"} 
            onPress={handleAddToCart}
            isLoading={isAddingToCart}
            disabled={isOutOfStock}
            className={`h-12 px-2 shadow-lg ${isOutOfStock ? 'bg-gray-400' : ''}`}
            textClassName="text-[12px] font-bold"
          />
        </View>
      </View>
    </SafeAreaView>
  );
}