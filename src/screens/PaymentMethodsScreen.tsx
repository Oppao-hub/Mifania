import React, { useCallback, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import LoadingState from '../components/LoadingState';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useSelector } from 'react-redux';
import { ROUTES } from '../utils';
import { RootState, SavedPaymentMethod } from '../utils/types';
import Header from '../components/Header';
import SurfaceCard from '../components/SurfaceCard';
import EmptyState from '../components/EmptyState';
import ConfirmationBottomSheet from '../components/ConfirmationBottomSheet';
import {
  getPaymentMethodIcon,
  getPaymentMethodIconColor,
  getPaymentMethodSubtitle,
} from '../utils/paymentMethodUi';
import {
  deleteSavedPaymentMethod,
  getSavedPaymentMethods,
} from '../app/api/savedPaymentMethod';
import { isApiRequestError } from '../app/api/client';
import { showBlockingError } from '../utils/userFeedback';

const PaymentMethodsScreen = () => {
  const navigation = useNavigation<any>();
  const token = useSelector((state: RootState) => state.authentication.data?.token);
  const [methods, setMethods] = useState<SavedPaymentMethod[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [methodToRemove, setMethodToRemove] = useState<SavedPaymentMethod | null>(null);
  const [isRemoving, setIsRemoving] = useState(false);
  const loadInFlightRef = useRef(false);

  const loadMethods = useCallback(async () => {
    if (!token) {
      setIsLoading(false);
      return;
    }
    if (loadInFlightRef.current) {
      return;
    }

    loadInFlightRef.current = true;
    setIsLoading(true);
    setLoadError(null);
    try {
      const data = await getSavedPaymentMethods(token);
      setMethods(data);
    } catch (error) {
      const message = isApiRequestError(error) && error.status === 503
        ? 'Payment methods are temporarily unavailable. Please try again in a moment.'
        : error instanceof Error
          ? error.message
          : 'Failed to load payment methods.';
      setLoadError(message);
      setMethods([]);
    } finally {
      loadInFlightRef.current = false;
      setIsLoading(false);
    }
  }, [token]);

  useFocusEffect(
    useCallback(() => {
      loadMethods();
    }, [loadMethods]),
  );

  const handleAdd = () => {
    navigation.navigate(ROUTES.ADD_PAYMENT_METHOD as never);
  };

  const handleRemove = (method: SavedPaymentMethod) => {
    if (!method.id || !token) return;
    setMethodToRemove(method);
  };

  const handleConfirmRemove = async () => {
    const id = methodToRemove?.id;
    if (!id || !token) return;

    setIsRemoving(true);
    try {
      await deleteSavedPaymentMethod(id, token);
      await loadMethods();
      setMethodToRemove(null);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not remove payment method.';
      showBlockingError({ title: 'Payment Methods', message });
      setMethodToRemove(null);
    } finally {
      setIsRemoving(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-app-bg" edges={['top']}>
      <Header
        title="Payment Methods"
        hideNotificationBell
        rightIcon="add"
        onRightPress={handleAdd}
      />

      {isLoading ? (
        <LoadingState message="Loading payment methods..." />
      ) : loadError ? (
        <View className="flex-1 px-6">
          <EmptyState
            iconName="cloud-off-outline"
            title="Could not load payment methods"
            description={loadError}
            buttonText="Try again"
            onButtonPress={loadMethods}
          />
        </View>
      ) : (
        <ScrollView
          className="flex-1 px-6"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40, flexGrow: methods.length === 0 ? 1 : undefined }}
        >
          {methods.length === 0 ? (
            <EmptyState
              iconName="credit-card-outline"
              title="No payment methods"
              description="Add a card or connect PayPal, Google Pay, or Apple Pay for faster checkout."
            />
          ) : (
            methods.map((method) => (
              <SurfaceCard
                key={String(method.id)}
                className="flex-row items-center px-4 py-4 mb-3"
              >
                <TouchableOpacity
                  activeOpacity={0.85}
                  onLongPress={() => handleRemove(method)}
                  className="flex-row items-center flex-1"
                >
                  <View className="w-12 h-12 rounded-xl bg-white border border-border-color items-center justify-center mr-4">
                    <Icon
                      name={getPaymentMethodIcon(method)}
                      size={26}
                      color={getPaymentMethodIconColor(method)}
                    />
                  </View>
                  <View className="flex-1">
                    <Text className="text-[15px] font-montserrat-bold text-dark-gray">
                      {method.displayName || 'Payment method'}
                    </Text>
                    {method.providerType === 'card' ? (
                      <Text className="text-sm font-montserrat text-gray mt-0.5">
                        {getPaymentMethodSubtitle(method)}
                      </Text>
                    ) : null}
                  </View>
                  <Text className="text-xs font-montserrat text-gray">Connected</Text>
                </TouchableOpacity>
              </SurfaceCard>
            ))
          )}
        </ScrollView>
      )}

      {!isLoading && !loadError ? (
        <View className="px-6 pb-6">
          <TouchableOpacity
            onPress={handleAdd}
            className="bg-brand rounded-full py-4 items-center"
            activeOpacity={0.9}
          >
            <Text className="text-white font-montserrat-bold text-base">Add Payment Method</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      <ConfirmationBottomSheet
        visible={methodToRemove !== null}
        title="Remove Payment Method"
        titleTone="danger"
        message={
          methodToRemove
            ? `Disconnect ${methodToRemove.displayName || 'this payment method'}?`
            : ''
        }
        cancelLabel="Cancel"
        confirmLabel="Remove"
        confirmVariant="danger"
        onCancel={() => {
          if (isRemoving) return;
          setMethodToRemove(null);
        }}
        onConfirm={handleConfirmRemove}
        isLoading={isRemoving}
      />
    </SafeAreaView>
  );
};

export default PaymentMethodsScreen;
