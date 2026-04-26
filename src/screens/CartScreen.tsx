import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const CartScreen = () => {
  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <ScrollView 
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-2xl font-bold text-gray-800 mb-2">Your Cart</Text>
          <Text className="text-gray-500 text-center">Your shopping cart is empty. Start exploring our latest fashion collection!</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default CartScreen;