import React, { useState, useEffect, useMemo } from 'react';
import { 
  View, 
  Text, 
  Image, 
  ScrollView, 
  TouchableOpacity, 
  Dimensions,
  StatusBar,
  Linking
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import Toast from 'react-native-toast-message';
import { ASSET_URL } from '../app/api/client';
import Button from '../components/Button';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../app/reducers/cart';
import { getProducts } from '../app/reducers/product';
import { toggleWishlist } from '../app/reducers/wishlist';
import { Color, Product, RootState, Size } from '../utils/types';
import { ROUTES } from '../utils';
import {
  COLOR_OPTIONS,
  SIZE_OPTIONS,
  findProductVariant,
  getProductStock,
  normalizeProductColor,
  normalizeProductSize,
} from '../utils/productVariants';

const { width } = Dimensions.get('window');

export default function ProductDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const dispatch = useDispatch();
  const wishlistItems = useSelector((state: RootState) => state.wishlist.items);
  const catalogProducts = useSelector((state: RootState) => state.product.items);
  const { isLoading: isCartLoading, error: cartError } = useSelector((state: RootState) => state.cart);

  const { product }: { product?: Product } = route.params || {};
  const isWishlisted = wishlistItems.some((item) => item.id === product?.id);

  const [selectedSize, setSelectedSize] = useState<Size>(Size.LARGE);
  const [selectedColor, setSelectedColor] = useState<Color>(Color.BLACK);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isBuyingNow, setIsBuyingNow] = useState(false);

  useEffect(() => {
    if (catalogProducts.length === 0) {
      dispatch(getProducts());
    }
  }, [dispatch, catalogProducts.length]);

  useEffect(() => {
    if (!product) return;
    setSelectedSize(normalizeProductSize(product.size) ?? Size.LARGE);
    setSelectedColor(normalizeProductColor(product.color) ?? Color.BLACK);
  }, [product]);

  const resolvedProduct = useMemo((): Product | null => {
    if (!product) return null;
    if (product.size === selectedSize && product.color === selectedColor) {
      return product;
    }
    return findProductVariant(catalogProducts, product, selectedSize, selectedColor) ?? null;
  }, [product, catalogProducts, selectedSize, selectedColor]);

  const variantUnavailable = !resolvedProduct;
  const activeProduct = resolvedProduct ?? product;

  const getImageUrl = (url?: string) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    const separator = url.startsWith('/') ? '' : '/';
    return `${ASSET_URL}${separator}${url}`;
  };

  const displayProduct = {
    id: activeProduct?.id,
    name: activeProduct?.name || product?.name || 'Loading...',
    price: activeProduct?.price || product?.price || '0',
    description: activeProduct?.description || product?.description || '',
    image: activeProduct?.imageUrl
      ? getImageUrl(activeProduct.imageUrl)
      : getImageUrl(activeProduct?.image || product?.image),
    stock: getProductStock(activeProduct ?? product ?? null),
    qrTag: activeProduct?.qrTag
      ? getImageUrl(
          typeof activeProduct.qrTag === 'object' ? activeProduct.qrTag.image : activeProduct.qrTag,
        )
      : null,
    material: activeProduct?.material || product?.material || 'Not specified',
  };

  const isOutOfStock = variantUnavailable || displayProduct.stock <= 0;
  const isLowStock = !variantUnavailable && displayProduct.stock > 0 && displayProduct.stock <= 5;

  // Handle Cart Success/Error
  useEffect(() => {
    if ((isAddingToCart || isBuyingNow) && !isCartLoading) {
      if (cartError) {
        Toast.show({
          type: 'modalError',
          text1: 'Oops!',
          text2: cartError,
        });
      } else if (isBuyingNow) {
        navigation.navigate(ROUTES.CART as never);
      } else {
        Toast.show({
          type: 'modalSuccess',
          text1: 'Success!',
          text2: `${displayProduct.name} has been added to your cart.`,
        });
      }
      setIsAddingToCart(false);
      setIsBuyingNow(false);
    }
  }, [isCartLoading, cartError, isAddingToCart, isBuyingNow, displayProduct.name, navigation]);

  const addResolvedToCart = () => {
    if (!resolvedProduct?.id) {
      Toast.show({
        type: 'modalError',
        text1: 'Unavailable',
        text2: 'This size and color combination is not available.',
      });
      return false;
    }
    if (getProductStock(resolvedProduct) <= 0) {
      Toast.show({
        type: 'modalError',
        text1: 'Out of stock',
        text2: 'This variant is currently out of stock.',
      });
      return false;
    }
    dispatch(addToCart(resolvedProduct.id, 1));
    return true;
  };

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    if (!addResolvedToCart()) return;
    setIsAddingToCart(true);
  };

  const handleBuyNow = () => {
    if (isOutOfStock) return;
    if (!addResolvedToCart()) return;
    setIsBuyingNow(true);
  };

  const handleToggleWishlist = () => {
    if (!product) return;
    dispatch(toggleWishlist(product));
  };

  const handleViewSustainabilityJourney = async () => {
    if (!product?.slug) {
      Toast.show({
        type: 'modalError',
        text1: 'Unavailable',
        text2: 'Sustainability story is not available for this product yet.',
      });
      return;
    }

    const journeyUrl = `${ASSET_URL}/shop/journey/${product.slug}`;
    const supported = await Linking.canOpenURL(journeyUrl);
    if (!supported) {
      Toast.show({
        type: 'modalError',
        text1: 'Unable to open',
        text2: 'Could not open sustainability story link.',
      });
      return;
    }

    await Linking.openURL(journeyUrl);
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
            {variantUnavailable ? (
              <Text className="text-sm font-bold text-red-500">
                This size and color combination is not available
              </Text>
            ) : isOutOfStock ? (
              <Text className="text-sm font-bold text-red-500">Out of Stock</Text>
            ) : isLowStock ? (
              <Text className="text-sm font-bold text-orange-500">
                Low on Stock: Only {displayProduct.stock} left!
              </Text>
            ) : (
              <Text className="text-sm font-bold text-green-600">In Stock</Text>
            )}
          </View>
        </View>

        {/* SIZE SELECTOR */}
        <View className="px-4 mt-6">
          <Text className="text-base font-bold text-dark-gray mb-3">
            Size:{' '}
            <Text className="text-brand">
              {SIZE_OPTIONS.find((s) => s.value === selectedSize)?.label ?? selectedSize}
            </Text>
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View className="flex-row gap-3">
              {SIZE_OPTIONS.map((size) => (
                <TouchableOpacity
                  key={size.value}
                  onPress={() => setSelectedSize(size.value)}
                  className={`w-11 h-11 rounded-full border items-center justify-center ${
                    selectedSize === size.value ? 'bg-brand border-brand' : 'border-border-color bg-white'
                  }`}
                >
                  <Text
                    className={`text-sm font-bold ${
                      selectedSize === size.value ? 'text-white' : 'text-dark-gray'
                    }`}
                  >
                    {size.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* COLOR SELECTOR */}
        <View className="px-4 mt-6">
          <Text className="text-base font-bold text-dark-gray mb-3">
            Color: <Text className="text-brand">{selectedColor}</Text>
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View className="flex-row gap-3">
              {COLOR_OPTIONS.map((color) => (
                <TouchableOpacity
                  key={color.value}
                  onPress={() => setSelectedColor(color.value)}
                  className={`w-11 h-11 rounded-full border items-center justify-center ${
                    selectedColor === color.value ? 'border-dark-gray' : 'border-transparent'
                  }`}
                >
                  <View
                    style={{ backgroundColor: color.hex }}
                    className={`w-9 h-9 rounded-full ${
                      color.hex === '#FFFFFF' ? 'border border-border-color' : ''
                    }`}
                  />
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
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

          <TouchableOpacity
            onPress={handleViewSustainabilityJourney}
            activeOpacity={0.8}
            className="mt-4 bg-brand/10 border border-brand/20 rounded-xl px-4 py-3 flex-row items-center justify-center"
          >
            <Icon name="leaf-outline" size={18} color="#52622E" />
            <Text className="ml-2 text-brand font-bold text-sm">View Sustainability Story</Text>
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
            isLoading={isBuyingNow}
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