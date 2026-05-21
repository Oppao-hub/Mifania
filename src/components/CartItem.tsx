import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { CartItem } from '../utils/types';
import { ASSET_URL } from '../app/api/client';

interface CartItemProps {
    item: CartItem;
    onToggleSelection: (id: string | number) => void;
    onRemove: (id: string | number) => void;
    onUpdateQty: (id: string | number, qty: number) => void;
    onEdit?: (item: CartItem) => void;
}

const CartItemComponent: React.FC<CartItemProps> = ({ 
    item, 
    onToggleSelection, 
    onRemove,
    onEdit
}) => {
    const { product, quantity, price, selected } = item;
    
    const getImageUrl = (url?: string) => {
        if (!url) return null;
        if (url.startsWith('http')) return url;
        const separator = url.startsWith('/') ? '' : '/';
        return `${ASSET_URL}${separator}${url}`;
    };

    const imageSource = product.imageUrl 
        ? { uri: getImageUrl(product.imageUrl) }
        : product.image 
            ? { uri: getImageUrl(product.image) }
            : require('../assets/logos/logo.png');

    return (
        <View className="flex-row bg-white rounded-[24px] p-3 mb-4 shadow-sm border border-border-color">
            
            {/* Checkbox & Image Container */}
            <View className="flex-row items-center">
              <TouchableOpacity onPress={() => onToggleSelection(item.id)} className="mr-3">
                {selected ? (
                    <View className="w-6 h-6 rounded-md bg-brand items-center justify-center">
                        <Icon name="check" size={16} color="#FFFFFF" />
                    </View>
                ) : (
                    <View className="w-6 h-6 rounded-md border-[1.5px] border-gray-300" />
                )}
              </TouchableOpacity>
              
              <View className="w-20 h-28 rounded-2xl bg-gray-100 overflow-hidden">
                <Image 
                    source={imageSource} 
                    className="w-full h-full"
                    resizeMode="cover"
                />
              </View>
            </View>

            {/* Product Details */}
            <View className="flex-1 ml-4 py-1 justify-between">
              <View>
                <Text className="text-sm font-bold text-gray-900 mb-1 pr-2" numberOfLines={2}>
                  {product.name}
                </Text>
                <View className="space-y-1.5 mt-1">
                  {/* Note: size and color are placeholders as they aren't in the current CartItem type yet */}
                  <Text className="text-[11px] text-gray-500 font-medium">Size: L</Text>
                  <View className="flex-row items-center">
                    <Text className="text-[11px] text-gray-500 font-medium mr-1">Color: Black</Text>
                    <View className="w-2.5 h-2.5 rounded-full bg-[#111827]" />
                  </View>
                  <Text className="text-[11px] text-gray-500 font-medium">Qty: {quantity}</Text>
                </View>
              </View>
              <Text className="text-sm font-bold text-brand">
                ₱{parseFloat(price || '0').toFixed(2)}
              </Text>
            </View>

            {/* Action Buttons - Pushed to top and bottom */}
            <View className="justify-between items-end py-1 ml-1">
              <TouchableOpacity onPress={() => onEdit?.(item)} className="p-1 mb-2">
                <Icon name="pencil-outline" size={20} color="#6B7280" />
              </TouchableOpacity>
              
              <TouchableOpacity onPress={() => onRemove(item.id)} className="p-1 mt-2">
                <Icon name="trash-can-outline" size={22} color="#EF4444" />
              </TouchableOpacity>
            </View>

        </View>
    );
};

export default CartItemComponent;