import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { Order, OrderStatus } from '../utils/types';
import { ASSET_URL } from '../app/api/client';

interface OrderCardProps {
  item: Order;
  onPress: (order: Order) => void;
  onActionPress?: (order: Order) => void;
  hideActionButton?: boolean;
}

const OrderCard: React.FC<OrderCardProps> = ({ item, onPress, onActionPress, hideActionButton = false }) => {
  // Map OrderStatus to the display status and styles used in the design
  const getStatusDisplay = (status: OrderStatus | string) => {
    // Standardize status for comparison
    const s = String(status || '').toLowerCase();
    
    switch (s) {
      case 'completed':
      case 'delivered':
        return { label: 'Completed', color: 'text-brand', bgColor: 'bg-[#52622E]/10' };
      case 'pending':
        return { label: 'Pending', color: 'text-brand', bgColor: 'bg-[#52622E]/10' };
      case 'processing':
        return { label: 'Processing', color: 'text-brand', bgColor: 'bg-[#52622E]/10' };
      case 'shipped':
        return { label: 'In Delivery', color: 'text-brand', bgColor: 'bg-[#52622E]/10' };
      case 'cancelled':
        return { label: 'Cancelled', color: 'text-red-500', bgColor: 'bg-red-50' };
      default:
        return { label: String(status || 'Unknown'), color: 'text-gray', bgColor: 'bg-gray-100' };
    }
  };

  const statusInfo = getStatusDisplay(item.orderStatus);
  
  // Get main product for preview (the design shows one)
  const mainItem = item.orderItems?.[0];
  const mainItemObj = typeof mainItem === 'object' ? mainItem : null;
  const product = typeof mainItemObj?.product === 'object' ? mainItemObj.product : null;

  const getImageUrl = (url?: string) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    const separator = url.startsWith('/') ? '' : '/';
    return `${ASSET_URL}${separator}${url}`;
  };

  const imageSource = (product?.imageUrl || product?.image) 
    ? { uri: getImageUrl(product?.imageUrl || product?.image) }
    : require('../assets/logos/logo.png');

  const getActionText = (status: OrderStatus | string) => {
    const s = String(status || '').toLowerCase();
    if (s === 'cancelled') return 'Reorder';
    if (s === 'completed' || s === 'delivered') return 'Leave Review';
    return 'Track Order';
  };

  const statusLower = String(item.orderStatus || '').toLowerCase();
  const isInDelivery = statusLower === 'shipped' || statusLower === 'processing' || statusLower === 'pending';

  const displayPrice = () => {
    try {
        const val = parseFloat(item.totalAmount);
        return isNaN(val) ? '0.00' : val.toFixed(2);
    } catch {
        return '0.00';
    }
  };

  return (
    <View className="bg-white rounded-[24px] p-4 mb-5 border border-border-color shadow-sm">
      {/* Top Row: Order ID & Status Badge */}
      <View className="flex-row justify-between items-center mb-3">
        <View className="flex-row items-center">
            <Icon name="receipt-outline" size={16} color="#4B5563" />
            <Text className="font-montserrat-bold text-dark-gray text-xs ml-2">ORD-{item.id}</Text>
        </View>
        <View className={`px-3 py-1 rounded-md ${statusInfo.bgColor}`}>
          <Text className={`font-montserrat-bold text-[10px] ${statusInfo.color}`}>
            {statusInfo.label}
          </Text>
        </View>
      </View>

      {/* Divider */}
      <View className="h-[1px] bg-gray-100 mb-4" />

      {/* Product Details Row */}
      <TouchableOpacity 
        activeOpacity={0.7}
        onPress={() => onPress(item)}
        className="flex-row items-center mb-4"
      >
        {/* Image */}
        <View className="w-20 h-24 rounded-2xl bg-gray-100 overflow-hidden mr-4">
          <Image 
            source={imageSource} 
            className="w-full h-full"
            resizeMode="cover"
          />
        </View>
        
        {/* Text Info */}
        <View className="flex-1 justify-between h-24 py-1">
          <View>
            <Text className="font-montserrat-bold text-dark-gray text-sm mb-1" numberOfLines={2}>
                {product?.name || 'Product'}
            </Text>
            <View className="flex-row items-center mt-0.5">
                <Text className="text-[11px] text-gray font-montserrat mr-3">Color: {product?.color || 'N/A'}</Text>
                <Text className="text-[11px] text-gray font-montserrat">Size: {product?.size || 'N/A'}</Text>
            </View>
          </View>
          
          <View className="flex-row justify-between items-end">
            <Text className="font-montserrat-bold text-brand text-sm">₱{displayPrice()}</Text>
            <Text className="text-[11px] text-gray font-montserrat-bold">Qty: {mainItemObj?.quantity || 0}</Text>
          </View>
        </View>
      </TouchableOpacity>

      {/* Action Button */}
      {!hideActionButton && (
        <TouchableOpacity 
          activeOpacity={0.8}
          onPress={() => onActionPress?.(item)}
          className={`w-full h-12 rounded-full items-center justify-center flex-row ${
              isInDelivery ? 'bg-brand' : 'bg-transparent border border-brand'
          }`}
        >
          <Text className={`font-montserrat-bold text-sm tracking-wide ${
              isInDelivery ? 'text-white' : 'text-brand'
          }`}>
              {getActionText(item.orderStatus)}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default OrderCard;
