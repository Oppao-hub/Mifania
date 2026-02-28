import { View, Text, Dimensions, TouchableOpacity, Image } from 'react-native'
import React from 'react'

const ProductCard = ({ user,product, onPress }) => {
    return (
        <TouchableOpacity 
            className="bg-white rounded-2xl overflow-hidden mb-5 w-[48%] shadow=sm"
            onPress={onPress}  
            activeOpacity={0.8}     
        >
            <View className="w-full aspect-[3/4] bg-gray-100 relative">
                <Image 
                source={{ uri: product.image }} 
                className="w-full h-full"
                resizeMode="cover"
                />
                
                {/* Discount Badge using your 'brand' config */}
                {product.isNew && (
                <View className="absolute top-2 left-2 bg-brand px-2 py-1 rounded-md">
                    <Text className="text-white text-[10px] font-bold">NEW</Text>
                </View>
                )}
            </View>
            
            <View className="py-3 px-1">
                <Text className="text-[10px] text-gray-400 font-semibold tracking-wider">
                {product.category.toUpperCase()}
                </Text>
                <Text 
                className="text-sm font-bold text-mocha mt-1" 
                numberOfLines={1}
                >
                {product.name}
                </Text>
                <Text className="text-sm font-bold text-brand mt-1">
                PHP {product.price}
                </Text>
            </View>
        </TouchableOpacity>
    )
}

export default ProductCard