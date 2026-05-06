import { View, Text, TouchableOpacity, Image } from 'react-native'
import React from 'react'
import Icon from 'react-native-vector-icons/Ionicons'
import { useDispatch, useSelector } from 'react-redux'
import { RootState, Product } from '../utils/types'
import { toggleWishlist } from '../app/reducers/wishlist'
import { ASSET_URL } from '../app/api/client'

interface ProductCardProps {
    product: Product;
    onPress: () => void;
    containerStyle?: string;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onPress, containerStyle }) => {
    const dispatch = useDispatch();
    const wishlistItems = useSelector((state: RootState) => state.wishlist.items);
    const isWishlisted = wishlistItems.some(item => item.id === product.id);

    const handleToggleWishlist = () => {
        dispatch(toggleWishlist(product));
    };

    const imageSource = product.imageUrl 
        ? { uri: `${ASSET_URL}${product.imageUrl}` }
        : { uri: product.image };

    return (
        <TouchableOpacity
            className={`bg-light-gray rounded-2xl overflow-hidden mb-5 shadow-sm ${containerStyle || 'w-[48%]'}`}
            onPress={onPress}  
            activeOpacity={0.8}
        >
            <View className="w-full aspect-[3/4] bg-gray-100 relative">
                <Image 
                    source={imageSource} 
                    className="w-full h-full"
                    resizeMode="cover"
                />
                
                {/* Wishlist Button */}
                <TouchableOpacity 
                    className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/80 items-center justify-center shadow-sm"
                    onPress={handleToggleWishlist}
                >
                    <Icon 
                        name={isWishlisted ? "heart" : "heart-outline"} 
                        size={18} 
                        color={isWishlisted ? "#DC3545" : "#4B5563"} 
                    />
                </TouchableOpacity>
            </View>
            
            <View className="py-3 px-1">
                <Text className="text-sm font-bold text-brand mt-1" numberOfLines={1}>
                    {product.name}
                </Text>
                <View className="flex-row justify-between items-center mt-1">
                    <Text className="text-xs font-bold text-brand">
                        ${product.price ? parseFloat(product.price).toFixed(2) : '0.00'}
                    </Text>
                </View>
            </View>
        </TouchableOpacity>
    )
}

export default ProductCard;
