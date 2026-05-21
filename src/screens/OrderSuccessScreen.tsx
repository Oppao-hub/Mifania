import React from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, StatusBar } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ROUTES } from '../utils';

const OrderSuccessScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { pointsEarned } = route.params || { pointsEarned: 0 };

  const handleGoHome = () => {
    navigation.navigate('HomeTab');
  };

  const handleViewOrders = () => {
    navigation.navigate(ROUTES.ORDER);
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" />
      <View className="flex-1 items-center justify-center px-10">
        <View className="w-24 h-24 bg-brand/10 rounded-full items-center justify-center mb-8">
          <Icon name="checkmark-circle" size={80} color="#52622E" />
        </View>
        
        <Text className="text-2xl font-montserrat-bold text-dark-gray text-center mb-2">
          Order Placed Successfully!
        </Text>

        {pointsEarned > 0 && (
          <View className="bg-brand/5 px-6 py-3 rounded-2xl mb-6 flex-row items-center">
            <Icon name="star" size={20} color="#52622E" />
            <Text className="ml-2 text-brand font-montserrat-bold text-sm">
              You earned {pointsEarned} points!
            </Text>
          </View>
        )}
        
        <Text className="text-gray text-center font-montserrat mb-12 leading-6">
          Your order has been confirmed and is being processed. You can track your order status in the orders section.
        </Text>

        <TouchableOpacity 
          onPress={handleViewOrders}
          className="bg-brand w-full h-14 rounded-2xl items-center justify-center mb-4 shadow-sm"
        >
          <Text className="text-white font-montserrat-bold text-sm uppercase tracking-wider">
            View My Orders
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={handleGoHome}
          className="w-full h-14 rounded-2xl items-center justify-center border border-border-color"
        >
          <Text className="text-dark-gray font-montserrat-bold text-sm uppercase tracking-wider">
            Continue Shopping
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default OrderSuccessScreen;
