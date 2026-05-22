import React from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  Image 
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import OrderCard from '../OrderCard';
import { Customer, OrderItem } from '../../utils/types';
import { ASSET_URL } from '../../app/api/client';

interface OrderDetailsContentProps {
  order: any;
}

const OrderDetailsContent = ({ order }: OrderDetailsContentProps) => {
  const customer = order.customer as Customer | undefined;

  const getImageUrl = (url?: string) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    const separator = url.startsWith('/') ? '' : '/';
    return `${ASSET_URL}${separator}${url}`;
  };
  
  return (
    <ScrollView 
      className="flex-1 px-6 pt-2"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 100 }}
    >
      {/* --- 1. REUSED ORDER CARD --- */}
      <OrderCard 
        item={order} 
        onPress={() => {}} 
        hideActionButton={true}
      />

      {/* --- 2. ORDER INFO CARD --- */}
      <View className="bg-white rounded-[24px] p-5 mb-4 shadow-sm border border-border-color">
        <View className="space-y-3">
          <View className="flex-row justify-between items-center">
            <Text className="text-sm font-montserrat text-gray">Order Date</Text>
            <Text className="text-sm font-montserrat-bold text-dark-gray">
              {order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              }) : 'N/A'}
            </Text>
          </View>
          <View className="flex-row justify-between items-center">
            <Text className="text-sm font-montserrat text-gray">Tracking No.</Text>
            <View className="flex-row items-center">
              <Text className="text-sm font-montserrat-bold text-dark-gray mr-2">MIF-{order.id || 'N/A'}84729</Text>
              <TouchableOpacity hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                  <Icon name="copy-outline" size={16} color="#52622E" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>

      {/* --- 3. PURCHASED ITEMS CARD --- */}
      {order.orderItems && order.orderItems.length > 1 && (
        <View className="bg-white rounded-[24px] p-5 mb-4 shadow-sm border border-border-color">
          <Text className="font-montserrat-bold text-dark-gray text-sm mb-4">Purchased Items</Text>
          
          {(order.orderItems as (string | OrderItem)[] | undefined)?.map((item: any, index: number) => {
            const itemImageUrl = item.product?.imageUrl || item.product?.image;
            const itemImageSource = itemImageUrl 
                ? { uri: getImageUrl(itemImageUrl) || 'https://via.placeholder.com/100' }
                : require('../../assets/logos/logo.png');

            return (
                <View key={index}>
                    <View className="flex-row items-center mb-1">
                        <View className="w-16 h-20 rounded-xl bg-gray-100 overflow-hidden mr-4">
                            <Image 
                                source={itemImageSource} 
                                className="w-full h-full"
                                resizeMode="cover"
                            />
                        </View>
                        <View className="flex-1 justify-between py-1">
                            <Text className="font-montserrat-bold text-dark-gray text-sm mb-1" numberOfLines={2}>
                                {item.product?.name || 'Product'}
                            </Text>
                            <View className="flex-row items-center mb-1">
                                <Text className="text-[11px] text-gray font-montserrat mr-3">Color: {item.product?.color || 'N/A'}</Text>
                                <Text className="text-[11px] text-gray font-montserrat">Size: {item.product?.size || 'N/A'}</Text>
                            </View>
                            <View className="flex-row justify-between items-center mt-1">
                                <Text className="font-montserrat-bold text-brand text-sm">₱{parseFloat(item.price || '0').toFixed(2)}</Text>
                                <Text className="text-[11px] text-gray font-montserrat-bold">Qty: {item.quantity}</Text>
                            </View>
                        </View>
                    </View>
                    {index !== (order.orderItems?.length || 0) - 1 && (
                        <View className="h-[1px] bg-gray-100 my-4" />
                    )}
                </View>
            );
          })}
        </View>
      )}

      {/* --- 4. SHIPPING DETAILS CARD --- */}
      <View className="bg-white rounded-[24px] p-5 mb-4 shadow-sm border border-border-color">
        <Text className="font-montserrat-bold text-dark-gray text-sm mb-4">Shipping Details</Text>
        
        <View className="flex-row">
          <View className="w-10 h-10 rounded-full bg-brand/10 items-center justify-center mr-4 mt-1">
              <Icon name="location" size={20} color="#52622E" />
          </View>
          <View className="flex-1">
              {typeof customer === 'object' && customer !== null ? (
                <>
                  <Text className="font-montserrat-bold text-dark-gray text-sm mb-1">{customer.firstName} {customer.lastName}</Text>
                  <Text className="text-xs text-gray font-montserrat mb-1">{customer.contactNumber || 'No contact'}</Text>
                  <Text className="text-xs text-gray font-montserrat leading-5">{customer.address}, {customer.city}</Text>
                </>
              ) : (
                <Text className="text-xs text-gray font-montserrat">Loading customer details...</Text>
              )}
          </View>
        </View>
      </View>

      {/* --- 5. PAYMENT SUMMARY CARD --- */}
      <View className="bg-white rounded-[24px] p-5 mb-6 shadow-sm border border-border-color">
        <Text className="font-montserrat-bold text-dark-gray text-sm mb-4">Payment Summary</Text>
        
        <View className="space-y-3 mb-4">
          <View className="flex-row justify-between items-center">
            <Text className="text-xs font-montserrat text-gray">Payment Method</Text>
            <Text className="text-xs font-montserrat-bold text-dark-gray">{order.paymentMethod}</Text>
          </View>
          <View className="flex-row justify-between items-center">
            <Text className="text-xs font-montserrat text-gray">Subtotal</Text>
            <Text className="text-xs font-montserrat-bold text-dark-gray">₱{parseFloat(order.totalAmount).toFixed(2)}</Text>
          </View>
          <View className="flex-row justify-between items-center">
            <Text className="text-xs font-montserrat text-gray">Shipping Fee</Text>
            <Text className="text-xs font-montserrat-bold text-dark-gray">₱0.00</Text>
          </View>
        </View>

        <View className="h-[1px] bg-gray-200 mb-3" />
        
        <View className="flex-row justify-between items-center">
          <Text className="text-sm font-montserrat-bold text-dark-gray">Total Amount</Text>
          <Text className="text-lg font-montserrat-bold text-brand">₱{parseFloat(order.totalAmount).toFixed(2)}</Text>
        </View>
      </View>
    </ScrollView>
  );
};

export default OrderDetailsContent;
