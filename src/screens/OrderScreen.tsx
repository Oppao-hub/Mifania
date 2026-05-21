import React, { useEffect } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  ActivityIndicator, 
  TouchableOpacity 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Header from '../components/Header';
import EmptyState from '../components/EmptyState';
import { RootState } from '../utils/types';
import * as Types from '../app/actions';

const OrderScreen = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const { items: orders, isLoading } = useSelector((state: RootState) => state.order);
  const { data: authData } = useSelector((state: RootState) => state.authentication);
  const token = authData?.token;

  useEffect(() => {
    if (token) {
      dispatch({ type: Types.GET_ORDERS, payload: token });
    }
  }, [token, dispatch]);

  const getStatusConfig = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'COMPLETED':
        return { 
          color: '#10B981', 
          bgColor: 'bg-green-50', 
          icon: 'check-circle' 
        };
      case 'PENDING':
        return { 
          color: '#F59E0B', 
          bgColor: 'bg-amber-50', 
          icon: 'clock-outline' 
        };
      case 'CANCELLED':
        return { 
          color: '#EF4444', 
          bgColor: 'bg-red-50', 
          icon: 'close-circle' 
        };
      default:
        return { 
          color: '#6B7280', 
          bgColor: 'bg-gray-50', 
          icon: 'help-circle' 
        };
    }
  };

  const renderOrderItem = ({ item }: { item: any }) => {
    const statusConfig = getStatusConfig(item.status);

    return (
      <TouchableOpacity 
        activeOpacity={0.7}
        className="bg-white rounded-lg p-4 mb-4 shadow-sm border border-border-color"
      >
        <View className="flex-row justify-between items-start mb-4">
          <View className="flex-row items-center">
            <View className={`w-10 h-10 rounded-full ${statusConfig.bgColor} items-center justify-center mr-3`}>
              <Icon name="package-variant-closed" size={20} color={statusConfig.color} />
            </View>
            <View>
              <Text className="text-[10px] font-montserrat-medium text-gray-500 uppercase tracking-wider">Order ID</Text>
              <Text className="text-sm font-montserrat-bold text-dark-gray">#{item.id}</Text>
            </View>
          </View>

          <View className={`px-3 py-1.5 rounded-full ${statusConfig.bgColor} flex-row items-center`}>
            <Icon name={statusConfig.icon} size={14} color={statusConfig.color} />
            <Text 
              className="text-[10px] font-montserrat-bold ml-1"
              style={{ color: statusConfig.color }}
            >
              {item.status}
            </Text>
          </View>
        </View>

        <View className="flex-row justify-between items-end border-t border-gray-50 pt-4">
          <View>
            <Text className="text-[10px] font-montserrat-medium text-gray-500 uppercase tracking-wider">Placed on</Text>
            <Text className="text-xs font-montserrat-medium text-gray-700 mt-0.5">
              {new Date(item.createdAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              })}
            </Text>
          </View>

          <View className="items-end">
            <Text className="text-[10px] font-montserrat-medium text-gray-500 uppercase tracking-wider">Total Amount</Text>
            <Text className="text-lg font-montserrat-bold text-brand">₱{parseFloat(item.totalAmount).toFixed(2)}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-app-bg" edges={['top']}>
      <Header title="My Orders" />

      {isLoading && orders.length === 0 ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#52622E" />
        </View>
      ) : orders.length > 0 ? (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderOrderItem}
          className="px-6 pt-2"
          contentContainerStyle={{ paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <EmptyState 
          iconName="package-variant"
          title="No orders yet"
          description="Your order history is empty. Start shopping to see your orders here!"
          buttonText="Browse Products"
          onButtonPress={() => navigation.navigate('HomeTab' as never)}
        />
      )}
    </SafeAreaView>
  );
};

export default OrderScreen;