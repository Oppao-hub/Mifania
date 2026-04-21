import { View, Text, TouchableOpacity, Image } from 'react-native'
import React from 'react'

interface ProductCardProps {
    productName: string;
    productImage: string;
    onPress: () => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ productName, productImage, onPress }) => {
    return (
        <TouchableOpacity 
            className="bg-white rounded-2xl overflow-hidden mb-5 w-[48%] shadow-sm"
            onPress={onPress}  
            activeOpacity={0.8}     
        >
            <View className="w-full aspect-[3/4] bg-gray-100 relative">
                <Image 
                    source={{ uri: productImage }} 
                    className="w-full h-full"
                    resizeMode="cover"
                />
            </View>
            
            <View className="py-3 px-1">
                <Text className="text-sm font-bold text-brand mt-1" numberOfLines={1}>
                    {productName}
                </Text>
            </View>
        </TouchableOpacity>
    )
}

export default ProductCard;