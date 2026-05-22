import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import Header from '../components/Header';
import OrderCard from '../components/OrderCard';
import EmptyState from '../components/EmptyState';
import { RootState } from '../utils/types';
import * as Types from '../app/actions';
import { ROUTES } from '../utils';

const OrderScreen = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation<any>();
  const [activeTab, setActiveTab] = useState<'Active' | 'Completed' | 'Cancelled'>('Active');
  
  const { items: orders, isLoading, isError, error } = useSelector((state: RootState) => state.order);
  const { data: authData } = useSelector((state: RootState) => state.authentication);
  const token = authData?.token;
  const [refreshing, setRefreshing] = useState(false);

  const fetchOrders = useCallback(() => {
    if (token) {
      console.log('🔄 OrderScreen: Dispatching GET_ORDERS');
      dispatch({ type: Types.GET_ORDERS, payload: token });
    }
  }, [token, dispatch]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  useFocusEffect(
    useCallback(() => {
      fetchOrders();
    }, [fetchOrders])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    fetchOrders();
    setTimeout(() => setRefreshing(false), 1000);
  };

  const filteredOrders = useMemo(() => {
    console.log('📊 OrderScreen: Total raw orders from state:', orders.length);
    
    if (orders.length > 0) {
        // Log all unique statuses found in the data to help debug
        const uniqueStatuses = [...new Set(orders.map(o => o.orderStatus))];
        console.log('🔍 OrderScreen: Unique statuses in data:', JSON.stringify(uniqueStatuses));
    }
    
    const filtered = orders.filter(o => {
        // Safe check for orderStatus
        const status = String(o.orderStatus || '').toLowerCase();
        
        if (activeTab === 'Active') {
            return status === 'pending' || 
                   status === 'processing' || 
                   status === 'shipped';
        } else if (activeTab === 'Completed') {
            return status === 'completed' || 
                   status === 'delivered';
        } else {
            return status === 'cancelled';
        }
    });
    
    console.log(`📍 OrderScreen: Filtered for tab [${activeTab}] -> Found ${filtered.length} items`);
    return filtered;
  }, [orders, activeTab]);

  const handleOrderPress = (order: any) => {
    navigation.navigate(ROUTES.ORDER_MANAGEMENT, { orderId: order.id, orderIri: order['@id'], initialTab: 'Details' });
  };

  return (
    <SafeAreaView className="flex-1 bg-app-bg" edges={['top']}>
      <Header title="My Orders" />

      {/* Segmented Control */}
      <View className="px-6 my-2 pb-2">
        <View className="flex-row bg-white border border-border-color p-1 rounded-2xl shadow-sm">
          {['Active', 'Completed', 'Cancelled'].map((tab) => (
            <TouchableOpacity 
              key={tab}
              onPress={() => setActiveTab(tab as any)}
              className={`flex-1 py-2.5 rounded-xl items-center ${activeTab === tab ? 'bg-brand' : 'bg-transparent'}`}
            >
              <Text className={`font-montserrat-bold text-[11px] ${activeTab === tab ? 'text-white' : 'text-gray'}`}>
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Error State */}
      {isError && orders.length === 0 && (
        <View className="flex-1 justify-center items-center px-10">
          <Icon name="alert-circle-outline" size={64} color="#EF4444" />
          <Text className="text-lg font-montserrat-bold text-dark-gray mt-4 text-center">Failed to load orders</Text>
          <Text className="text-sm font-montserrat text-gray mt-2 text-center">{error}</Text>
          <TouchableOpacity 
            onPress={fetchOrders}
            className="mt-6 bg-brand px-8 py-3 rounded-xl"
          >
            <Text className="text-white font-montserrat-bold">Try Again</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Loading State (Initial) */}
      {isLoading && orders.length === 0 ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#52622E" />
        </View>
      ) : (
        <FlatList 
          data={filteredOrders}
          keyExtractor={(item, index) => item.id?.toString() || index.toString()}
          renderItem={({ item }) => (
            <OrderCard 
              item={item} 
              onPress={handleOrderPress} 
              onActionPress={handleOrderPress} 
            />
          )}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            { paddingHorizontal: 24, paddingTop: 10, paddingBottom: 100 },
            filteredOrders.length === 0 && { flexGrow: 1, justifyContent: 'center' }
          ]}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#52622E']}
              tintColor={'#52622E'}
            />
          }
          ListEmptyComponent={
            <EmptyState 
              iconName="cube-outline"
              title={orders.length > 0 
                ? `${activeTab} Orders` 
                : "No Orders Yet"}
              description={orders.length > 0 
                ? `You don't have any ${activeTab.toLowerCase()} orders at the moment.`
                : "Looks like you haven't placed any orders yet. Start shopping to see them here!"}
              buttonText={orders.length === 0 ? "Start Shopping" : undefined}
              onButtonPress={orders.length === 0 ? () => navigation.navigate(ROUTES.HOME as any) : undefined}
            />
          }
        />
      )}
    </SafeAreaView>
  );
};

export default OrderScreen;