import React from 'react';
import { View, StatusBar, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import ReusableOverlay from '../components/ReusableOverlay';
import Button from '../components/Button';
import { goToHomeTab, goToMyOrders } from '../utils/navigation';

const BRAND = '#52622E';

const SuccessIcon = () => (
  <View className="w-28 h-28 items-center justify-center mb-6">
    <View className="absolute w-3 h-3 rounded-full bg-brand/30 top-2 left-6" />
    <View className="absolute w-2 h-2 rounded-full bg-brand/40 top-8 right-4" />
    <View className="absolute w-2.5 h-2.5 rounded-full bg-brand/25 bottom-6 left-3" />
    <View className="absolute w-2 h-2 rounded-full bg-brand/35 bottom-4 right-6" />
    <View className="w-20 h-20 rounded-full bg-brand items-center justify-center">
      <Icon name="checkmark" size={44} color="#FFFFFF" />
    </View>
  </View>
);

const OrderSuccessScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { pointsEarned = 0 } = route.params || {};

  return (
    <SafeAreaView className="flex-1 bg-app-bg" edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" />
      <View className="flex-1" />
      <ReusableOverlay
        visible
        closeOnBackdropPress={false}
        backdropClassName="flex-1 bg-black/50 justify-center items-center px-8"
        contentClassName="bg-white rounded-3xl w-full max-w-sm px-6 py-8 items-center"
      >
        <SuccessIcon />
        <Text className="text-xl font-montserrat-bold text-dark-gray text-center mb-3">
          Order Confirmed!
        </Text>
        <Text className="text-sm font-montserrat text-gray text-center leading-5 mb-2 px-2">
          Peep your order details in &apos;My Order&apos; and start planning outfits.
        </Text>
        {pointsEarned > 0 && (
          <View className="bg-brand/5 px-4 py-2 rounded-xl mb-4 flex-row items-center">
            <Icon name="star" size={16} color={BRAND} />
            <Text className="ml-2 text-brand font-montserrat-bold text-xs">
              You earned {pointsEarned} points!
            </Text>
          </View>
        )}
        <Button
          label="View My Order"
          onPress={() => goToMyOrders(navigation)}
          size="md"
          shape="pill"
          className="mt-2 mb-3"
        />
        <Button
          label="Back to Home"
          onPress={() => goToHomeTab(navigation)}
          variant="soft"
          size="md"
          shape="pill"
        />
      </ReusableOverlay>
    </SafeAreaView>
  );
};

export default OrderSuccessScreen;
