import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector, useDispatch } from 'react-redux';
import { useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import Header from '../components/Header';
import LoadingState from '../components/LoadingState';
import ConfirmationBottomSheet from '../components/ConfirmationBottomSheet';
import SuccessBottomSheet from '../components/SuccessBottomSheet';
import { RootState } from '../utils/types';
import * as Types from '../app/actions';
import { mergeSurfaceCardStyle } from '../utils/cardStyles';
import { canCancelOrderStatus, normalizeOrderStatus } from '../utils/orderPresentation';
import Button from '../components/Button';
import { showBlockingError, showBlockingInfo } from '../utils/userFeedback';
import { LIVE_SYNC_ORDER_POLL_MS } from '../config/realtime';
import { useScreenLiveSync } from '../hooks/useLiveSync';

import OrderDetailsContent from '../components/orders/OrderDetailsContent';
import OrderTracking from '../components/orders/OrderTracking';

const OrderManagementScreen = () => {
  const dispatch = useDispatch();
  const route = useRoute<any>();

  const initialTab = route.params?.initialTab || 'Details';
  const [activeTab, setActiveTab] = useState<'Details' | 'Tracking'>(initialTab);
  const [showCancelSheet, setShowCancelSheet] = useState(false);
  const [showSuccessSheet, setShowSuccessSheet] = useState(false);
  const pendingCancelRef = useRef(false);

  const { orderId, orderIri } = route.params;

  const { currentOrder: order, isLoading, error, cancelError } = useSelector((state: RootState) => state.order);
  const { data: authData } = useSelector((state: RootState) => state.authentication);
  const token = authData?.token;

  const fetchOrder = useCallback(() => {
    if (!token) {
      return;
    }

    dispatch({
      type: Types.GET_ORDER_DETAILS,
      payload: { id: orderIri || orderId, token },
    });
  }, [orderId, orderIri, token, dispatch]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  useScreenLiveSync(fetchOrder, LIVE_SYNC_ORDER_POLL_MS, Boolean(token));

  useEffect(() => {
    if (!pendingCancelRef.current || isLoading || !order) return;

    if (normalizeOrderStatus(order.orderStatus) === 'cancelled') {
      pendingCancelRef.current = false;
      setShowCancelSheet(false);
      setShowSuccessSheet(true);
    }
  }, [order, isLoading]);

  useEffect(() => {
    if (!pendingCancelRef.current || isLoading || !cancelError) return;

    showBlockingError({
      title: 'Could not cancel order',
      message: cancelError,
    });
    pendingCancelRef.current = false;
    setShowCancelSheet(false);
  }, [cancelError, isLoading]);

  if (isLoading && !order) {
    return (
      <SafeAreaView className="flex-1 bg-app-bg" edges={['top']}>
        <Header title="Order Status" showBack hideNotificationBell />
        <LoadingState message="Loading order..." />
      </SafeAreaView>
    );
  }

  const canCancelOrder = canCancelOrderStatus(order?.orderStatus);

  const handleConfirmCancel = () => {
    if (!order?.id || !token) return;

    pendingCancelRef.current = true;
    dispatch({
      type: Types.CANCEL_ORDER,
      payload: { orderId: order.id, token, suppressToast: true },
    });
  };

  if (!isLoading && !order) {
    return (
      <SafeAreaView className="flex-1 bg-app-bg" edges={['top']}>
        <Header title="Order Status" showBack hideNotificationBell />
        <View className="flex-1 justify-center items-center px-10">
          <Icon name="alert-circle-outline" size={64} color="#EF4444" />
          <Text className="text-lg font-montserrat-bold text-dark-gray mt-4 text-center">
            Failed to load order
          </Text>
          <Text className="text-sm font-montserrat text-gray mt-2 text-center">
            {error || 'This order could not be found.'}
          </Text>
          <TouchableOpacity onPress={fetchOrder} className="mt-6 bg-brand px-8 py-3 rounded-xl">
            <Text className="text-white font-montserrat-bold">Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-app-bg" edges={['top']}>
      <StatusBar barStyle="dark-content" />
      <Header title="Order Status" showBack hideNotificationBell />

      <View className="px-6 my-2 pb-2">
        <View
          className="flex-row bg-white border border-border-color p-1 rounded-2xl"
          style={mergeSurfaceCardStyle()}
        >
          {(['Details', 'Tracking'] as const).map((tab) => (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTab(tab)}
              className={`flex-1 py-2.5 rounded-xl items-center ${
                activeTab === tab ? 'bg-brand' : 'bg-transparent'
              }`}
            >
              <Text
                className={`font-montserrat-bold text-[11px] ${
                  activeTab === tab ? 'text-white' : 'text-gray'
                }`}
              >
                {tab === 'Details' ? 'Order Details' : 'Track Order'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View className="flex-1">
        {activeTab === 'Details' ? (
          <OrderDetailsContent order={order} />
        ) : (
          <OrderTracking order={order} />
        )}
      </View>

      {canCancelOrder ? (
        <View className="px-6 pb-6 pt-2">
          <Button
            label="Cancel Order"
            onPress={() => setShowCancelSheet(true)}
            variant="outline"
            shape="pill"
            fullWidth
            disabled={isLoading}
            textClassName="text-danger"
            className="border-danger"
          />
        </View>
      ) : null}

      <ConfirmationBottomSheet
        visible={showCancelSheet}
        title="Cancel Order"
        titleTone="danger"
        message="Are you sure you want to cancel the order?"
        description="It's okay to change your mind! Your payment will be safely refunded. Terms & Conditions apply."
        descriptionLinkText="Terms & Conditions"
        onDescriptionLinkPress={() =>
          showBlockingInfo({
            title: 'Terms & Conditions',
            message: 'Refund terms will be shown here.',
          })
        }
        cancelLabel="No, Don't Cancel"
        confirmLabel="Cancel Order"
        onCancel={() => {
          if (pendingCancelRef.current && isLoading) return;
          setShowCancelSheet(false);
          pendingCancelRef.current = false;
        }}
        onConfirm={handleConfirmCancel}
        isLoading={isLoading && pendingCancelRef.current}
      />

      <SuccessBottomSheet
        visible={showSuccessSheet}
        message="Order Canceled Successfully!"
        onDismiss={() => setShowSuccessSheet(false)}
      />
    </SafeAreaView>
  );
};

export default OrderManagementScreen;
