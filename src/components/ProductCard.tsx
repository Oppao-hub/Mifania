import { View, Text, TouchableOpacity, Image } from 'react-native';
import React from 'react';
import Icon from 'react-native-vector-icons/Ionicons';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, Product } from '../utils/types';
import { toggleWishlist } from '../app/reducers/wishlist';
import { ASSET_URL } from '../app/api/client';
import { mergeSurfaceCardStyle } from '../utils/cardStyles';
import { getProductRating } from '../utils/productPresentation';

interface ProductCardProps {
  product: Product;
  onPress: () => void;
  containerStyle?: string;
  variant?: 'grid' | 'carousel' | 'wishlist';
  onWishlistChange?: (product: Product, isWishlisted: boolean) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onPress,
  containerStyle,
  variant = 'grid',
  onWishlistChange,
}) => {
  const dispatch = useDispatch();
  const wishlistItems = useSelector((state: RootState) => state.wishlist.items);
  const isWishlisted = wishlistItems.some((item) => item.id === product.id);

  const handleToggleWishlist = () => {
    const wasWishlisted = isWishlisted;
    dispatch(toggleWishlist(product));
    onWishlistChange?.(product, !wasWishlisted);
  };

  const getImageUrl = (url?: string) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    const separator = url.startsWith('/') ? '' : '/';
    return `${ASSET_URL}${separator}${url}`;
  };

  const imageSource = product.imageUrl
    ? { uri: getImageUrl(product.imageUrl) ?? undefined }
    : product.image
      ? { uri: getImageUrl(product.image) ?? undefined }
      : require('../assets/logos/logo.png');

  const isCarousel = variant === 'carousel';
  const isWishlist = variant === 'wishlist';
  const defaultWidth = isCarousel ? 'w-36' : 'w-[48%]';
  const marginClass = isCarousel ? 'mb-0' : 'mb-5';

  const cardClassName = isWishlist
    ? 'bg-white border border-border-color rounded-2xl overflow-hidden shadow-sm'
    : `bg-light-gray rounded-2xl overflow-hidden shadow-sm`;

  return (
    <TouchableOpacity
      className={`${cardClassName} ${marginClass} ${containerStyle || defaultWidth}`}
      onPress={onPress}
      activeOpacity={0.8}
      style={isWishlist ? mergeSurfaceCardStyle() : undefined}
    >
      <View className={`w-full ${isCarousel ? 'h-44' : 'aspect-[3/4]'} bg-gray-100 relative`}>
        <Image source={imageSource} className="w-full h-full" resizeMode="cover" />

        {isWishlist ? (
          <View className="absolute bottom-2 left-2 flex-row items-center rounded-full bg-white/95 px-2 py-1">
            <Icon name="star" size={12} color="#F59E0B" />
            <Text className="ml-1 text-[11px] font-montserrat-bold text-dark-gray">
              {getProductRating(product)}
            </Text>
          </View>
        ) : null}

        <TouchableOpacity
          className={`absolute top-2 right-2 w-8 h-8 rounded-full items-center justify-center shadow-sm ${
            isWishlist ? 'bg-white' : isCarousel ? 'bg-white/80' : 'bg-dark-gray/75'
          }`}
          onPress={handleToggleWishlist}
        >
          <Icon
            name={isWishlisted ? 'heart' : 'heart-outline'}
            size={18}
            color={
              isWishlisted
                ? isWishlist
                  ? '#111827'
                  : '#DC3545'
                : isCarousel || isWishlist
                  ? '#4B5563'
                  : '#FFFFFF'
            }
          />
        </TouchableOpacity>
      </View>

      <View className={`${isCarousel ? 'py-2 px-2' : 'py-3 px-3'}`}>
        <Text
          className={`${isCarousel ? 'text-xs' : 'text-sm'} font-montserrat-bold text-dark-gray`}
          numberOfLines={1}
        >
          {product.name}
        </Text>
        <Text className="text-sm font-montserrat-bold text-brand mt-1">
          ₱{product.price ? parseFloat(product.price).toFixed(2) : '0.00'}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export default ProductCard;
