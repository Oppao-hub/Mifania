import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  ActivityIndicator,
  StatusBar,
  TouchableOpacity
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector, useDispatch } from 'react-redux';
import { useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import Header from '../components/Header';
import { RootState } from '../utils/types';
import * as Types from '../app/actions';
import { isUnauthorizedError } from '../utils/authSession';

// Import newly extracted components
import OrderDetailsContent from '../components/orders/OrderDetailsContent';
import OrderTracking from '../components/orders/OrderTracking';

const OrderManagementScreen = () => {
  const dispatch = useDispatch();

  const route = useRoute<any>();
  
  // Get initial tab from route params, default to 'Details'
  const initialTab = route.params?.initialTab || 'Details';
  const [activeTab, setActiveTab] = useState<'Details' | 'Tracking'>(initialTab);
  
  const { orderId, orderIri } = route.params;

  const { currentOrder: order, isLoading, error } = useSelector((state: RootState) => state.order);
  const { data: authData } = useSelector((state: RootState) => state.authentication);
  const token = authData?.token;

  const fetchOrder = useCallback(() => {
    if (!token) {
      dispatch({ type: Types.USER_LOGOUT });
      return;
    }

    dispatch({ 
      type: Types.GET_ORDER_DETAILS, 
      payload: { id: orderIri || orderId, token } 
    });
  }, [orderId, orderIri, token, dispatch]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  useEffect(() => {
    if (!token || isUnauthorizedError(error || undefined)) {
      dispatch({ type: Types.USER_LOGOUT });
    }
  }, [token, error, dispatch]);

  if (isLoading && !order) {
    return (
      <SafeAreaView className="flex-1 bg-app-bg" edges={['top']}>
        <Header title="Order Status" showBack />
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#52622E" />
        </View>
      </SafeAreaView>
    );
  }

  if (error || !order) {
    return (
      <SafeAreaView className="flex-1 bg-app-bg" edges={['top']}>
        <Header title="Order Status" showBack />
        <View className="flex-1 justify-center items-center px-10">
          <Icon name="alert-circle-outline" size={64} color="#EF4444" />
          <Text className="text-lg font-montserrat-bold text-dark-gray mt-4 text-center">Failed to load order</Text>
          <Text className="text-sm font-montserrat text-gray mt-2 text-center">{error}</Text>
          <TouchableOpacity 
            onPress={fetchOrder}
            className="mt-6 bg-brand px-8 py-3 rounded-xl"
          >
            <Text className="text-white font-montserrat-bold">Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-app-bg" edges={['top']}>
      <StatusBar barStyle="dark-content" />
      <Header title={activeTab === 'Details' ? "Order Details" : "Track Order"} showBack />

      {/* --- SEGMENTED NAVIGATOR --- */}
      <View className="px-6 my-2 pb-2">
        <View className="flex-row bg-white border border-border-color p-1 rounded-2xl shadow-sm">
          <TouchableOpacity 
            onPress={() => setActiveTab('Details')}
            className={`flex-1 py-2.5 rounded-xl items-center ${activeTab === 'Details' ? 'bg-brand' : 'bg-transparent'}`}
          >
            <Text className={`font-montserrat-bold text-[11px] ${activeTab === 'Details' ? 'text-white' : 'text-gray'}`}>
              Order Details
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            onPress={() => setActiveTab('Tracking')}
            className={`flex-1 py-2.5 rounded-xl items-center ${activeTab === 'Tracking' ? 'bg-brand' : 'bg-transparent'}`}
          >
            <Text className={`font-montserrat-bold text-[11px] ${activeTab === 'Tracking' ? 'text-white' : 'text-gray'}`}>
              Track Order
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* --- CONTENT --- */}
      <View className="flex-1">
        {activeTab === 'Details' ? (
            <OrderDetailsContent order={order} />
        ) : (
            <OrderTracking order={order} />
        )}
      </View>
    </SafeAreaView>
  );
};

export default OrderManagementScreen;
