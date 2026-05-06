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
    onUpdateQty,
    onEdit
}) => {
    const { product, quantity, price } = item;
    
    const imageSource = product.imageUrl 
        ? { uri: `${ASSET_URL}${product.imageUrl}` }
        : { uri: product.image };

    return (
        <View 
            className="flex-row bg-white rounded-lg p-3 mb-4 shadow-sm relative"
        >
            {/* Action Buttons (Upper Right - Vertical) */}
            <View className="absolute top-3 right-3 flex-col space-y-4 z-20">
                <TouchableOpacity onPress={() => onEdit?.(item)} className="p-1">
                    <Icon name="pencil-outline" size={20} color="#6A7282" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => onRemove(item.id)} className="p-1">
                    <Icon name="trash-can-outline" size={20} color="#EF4444" />
                </TouchableOpacity>
            </View>

            {/* Product Image Container */}
            <View className="relative w-36 h-44 rounded-lg overflow-hidden bg-gray-100">
                <Image 
                    source={imageSource} 
                    className="w-full h-full"
                    resizeMode="cover"
                />

                {/* Checkbox (Inside Image, Upper Left - Rounded Square) */}
                <TouchableOpacity 
                    onPress={() => onToggleSelection(item.id)}
                    className="absolute top-2 left-2 z-10"
                >
                    <Icon 
                        name={item.selected ? "checkbox-marked" : "checkbox-blank-outline"} 
                        size={26} 
                        color={item.selected ? "#52622E" : "rgba(255,255,255,0.9)"} 
                    />
                </TouchableOpacity>
            </View>

            {/* Product Details (Right Side) */}
            <View className="flex-1 ml-4 pr-10 justify-between py-1">
                <View>
                    <Text className="text-base font-bold text-gray-900 mb-1" numberOfLines={1}>
                        {product.name}
                    </Text>

                    <View className="space-y-1">
                        {/* Size and Color might need to be added to CartItem if backend supports them */}
                        {/* <Text className="text-xs text-gray-500 font-medium">Size: {item.size}</Text>
                        <Text className="text-xs text-gray-500 font-medium">Color: {item.color}</Text> */}
                        <Text className="text-sm text-gray-600 font-bold mt-1">Qty: {quantity}</Text>
                    </View>
                </View>

                <Text className="text-lg font-bold text-brand mt-1">
                    ${parseFloat(price || '0').toFixed(2)}
                </Text>
            </View>
        </View>
    );
};

export default CartItemComponent;
