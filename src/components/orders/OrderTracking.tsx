import React from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity 
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

interface OrderTrackingProps {
  order: any;
}

const OrderTracking = ({ order }: OrderTrackingProps) => {
  const getStatusStep = (status: string) => {
    const s = String(status || '').toLowerCase();
    switch (s) {
      case 'pending': return 1;
      case 'processing': return 2;
      case 'shipped': return 3;
      case 'delivered':
      case 'completed': return 4;
      default: return 1;
    }
  };

  const currentStep = getStatusStep(order.orderStatus);

  const renderTimelineStep = (step: number, title: string, description: string, icon: string, isLast = false) => {
    const isCompleted = currentStep >= step;
    const isCurrent = currentStep === step;

    return (
      <View className="flex-row" key={step}>
        <View className="items-center mr-4">
          <View className={`w-10 h-10 rounded-full items-center justify-center ${isCompleted ? 'bg-brand' : 'bg-gray-100'} border-4 border-white shadow-sm z-10`}>
            <Icon name={icon} size={20} color={isCompleted ? 'white' : '#9CA3AF'} />
          </View>
          {!isLast && (
            <View className={`w-[2px] h-16 ${isCompleted ? 'bg-brand' : 'bg-gray-100'}`} />
          )}
        </View>
        <View className="flex-1 pt-1 pb-8">
          <Text className={`font-montserrat-bold text-sm ${isCompleted ? 'text-dark-gray' : 'text-gray-400'}`}>
            {title}
          </Text>
          <Text className={`font-montserrat text-[11px] mt-1 ${isCompleted ? 'text-gray' : 'text-gray-300'}`}>
            {description}
          </Text>
          {isCurrent && (
             <View className="bg-brand/10 self-start px-2 py-0.5 rounded-md mt-2">
                <Text className="text-[9px] font-montserrat-bold text-brand uppercase tracking-tighter">Current Status</Text>
             </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <ScrollView 
      className="flex-1 px-6 pt-4"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 100 }}
    >
      {/* --- ORDER SUMMARY INFO --- */}
      <View className="bg-white rounded-[24px] p-5 mb-6 shadow-sm border border-border-color">
          <View className="flex-row justify-between items-center mb-4">
              <View>
                  <Text className="text-[10px] font-montserrat-bold text-gray uppercase tracking-widest mb-1">Order Number</Text>
                  <Text className="font-montserrat-bold text-dark-gray text-base">ORD-{order.id}</Text>
              </View>
              <View className="items-end">
                  <Text className="text-[10px] font-montserrat-bold text-gray uppercase tracking-widest mb-1">Estimated Arrival</Text>
                  <Text className="font-montserrat-bold text-brand text-sm">May 28, 2026</Text>
              </View>
          </View>
          <View className="h-[1px] bg-gray-50 mb-4" />
          <View className="flex-row items-center">
              <Icon name="cube-outline" size={16} color="#4B5563" />
              <Text className="text-xs font-montserrat text-gray ml-2">MIF-{order.id}847293849201</Text>
          </View>
      </View>

      {/* --- TIMELINE --- */}
      <View className="bg-white rounded-[24px] p-6 shadow-sm border border-border-color">
        <Text className="font-montserrat-bold text-dark-gray text-sm mb-6">Delivery Progress</Text>
        
        <View className="px-2">
          {renderTimelineStep(1, 'Order Placed', 'Your order has been received.', 'receipt-outline')}
          {renderTimelineStep(2, 'Order Processing', 'We are preparing your package.', 'cube-outline')}
          {renderTimelineStep(3, 'In Delivery', 'Your order is on the way.', 'truck-outline')}
          {renderTimelineStep(4, 'Delivered', 'Order reached your destination.', 'home-outline', true)}
        </View>
      </View>

      {/* --- HELP CARD --- */}
      <TouchableOpacity className="mt-6 flex-row items-center justify-between bg-[#52622E]/5 p-4 rounded-2xl border border-brand/10">
          <View className="flex-row items-center">
              <View className="w-10 h-10 rounded-full bg-brand/10 items-center justify-center mr-3">
                  <Icon name="chatbubble-ellipses-outline" size={20} color="#52622E" />
              </View>
              <View>
                  <Text className="font-montserrat-bold text-dark-gray text-xs">Need Help?</Text>
                  <Text className="text-[10px] text-gray font-montserrat">Chat with our customer support</Text>
              </View>
          </View>
          <Icon name="chevron-forward" size={16} color="#52622E" />
      </TouchableOpacity>
    </ScrollView>
  );
};

export default OrderTracking;
