import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import Header from '../components/Header';
import OrderCard from '../components/OrderCard';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';
import LoadingState from '../components/LoadingState';
import ConfirmationBottomSheet from '../components/ConfirmationBottomSheet';
import SuccessBottomSheet from '../components/SuccessBottomSheet';
import AnchorActionMenu, { MenuAnchor } from '../components/AnchorActionMenu';
import { RootState } from '../utils/types';
import * as Types from '../app/actions';
import { ROUTES } from '../utils';
import { goToCartTab, goToHomeTab } from '../utils/navigation';
import { useTabBarBottomPadding } from '../utils/layout';
import { mergeSurfaceCardStyle } from '../utils/cardStyles';
import {
  OrderListTab,
  canCancelOrderStatus,
  filterOrdersByTab,
  isCancelledOrderStatus,
  isCompletedOrderStatus,
  normalizeOrderStatus,
  sortOrdersByNewest,
} from '../utils/orderPresentation';
import type { Order } from '../utils/types';
import { showBlockingError, showBlockingInfo, showFeedbackToast } from '../utils/userFeedback';
import { LIVE_SYNC_ORDER_POLL_MS } from '../config/realtime';
import { useScreenLiveSync } from '../hooks/useLiveSync';

const TABS: OrderListTab[] = ['Active', 'Completed', 'Cancelled'];

const OrderScreen = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation<any>();
  const tabBarBottomPadding = useTabBarBottomPadding();
  const [activeTab, setActiveTab] = useState<OrderListTab>('Active');

  const { items: orders, isLoading, isError, error, cancelError, deleteError, isReordering, reorderError } =
    useSelector((state: RootState) => state.order);
  const { data: authData } = useSelector((state: RootState) => state.authentication);
  const token = authData?.token;
  const [refreshing, setRefreshing] = useState(false);

  const [menuAnchor, setMenuAnchor] = useState<MenuAnchor | null>(null);
  const [menuOrder, setMenuOrder] = useState<Order | null>(null);
  const [orderToCancel, setOrderToCancel] = useState<Order | null>(null);
  const [showCancelSheet, setShowCancelSheet] = useState(false);
  const [showSuccessSheet, setShowSuccessSheet] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState<Order | null>(null);
  const [showDeleteSheet, setShowDeleteSheet] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const pendingCancelIdRef = useRef<number | null>(null);
  const pendingDeleteIdRef = useRef<number | null>(null);
  const pendingReorderNavRef = useRef(false);

  const fetchOrders = useCallback(() => {
    if (token) {
      dispatch({ type: Types.GET_ORDERS, payload: token });
    }
  }, [token, dispatch]);

  useFocusEffect(
    useCallback(() => {
      fetchOrders();
    }, [fetchOrders]),
  );

  useScreenLiveSync(fetchOrders, LIVE_SYNC_ORDER_POLL_MS, Boolean(token));

  const onRefresh = async () => {
    setRefreshing(true);
    fetchOrders();
    setTimeout(() => setRefreshing(false), 1000);
  };

  const tabCounts = useMemo(
    () =>
      TABS.reduce(
        (acc, tab) => {
          acc[tab] = filterOrdersByTab(orders, tab).length;
          return acc;
        },
        {} as Record<OrderListTab, number>,
      ),
    [orders],
  );

  const filteredOrders = useMemo(() => {
    const filtered = filterOrdersByTab(orders, activeTab);
    return sortOrdersByNewest(filtered);
  }, [orders, activeTab]);

  useEffect(() => {
    const pendingId = pendingCancelIdRef.current;
    if (!isCancelling || isLoading || !pendingId) return;

    const updated = orders.find((order) => Number(order.id) === pendingId);
    if (updated && normalizeOrderStatus(updated.orderStatus) === 'cancelled') {
      pendingCancelIdRef.current = null;
      setIsCancelling(false);
      setShowCancelSheet(false);
      setOrderToCancel(null);
      setShowSuccessSheet(true);
      return;
    }

    if (cancelError) {
      showBlockingError({
        title: 'Could not cancel order',
        message: cancelError,
      });
      pendingCancelIdRef.current = null;
      setIsCancelling(false);
      setShowCancelSheet(false);
      setOrderToCancel(null);
      return;
    }

    setIsCancelling(false);
  }, [orders, isLoading, isCancelling, cancelError]);

  const handleOrderPress = (order: Order) => {
    navigation.navigate(ROUTES.ORDER_MANAGEMENT, {
      orderId: order.id,
      orderIri: order['@id'],
      initialTab: 'Details',
    });
  };

  const handleTrackOrder = (order: Order) => {
    navigation.navigate(ROUTES.ORDER_MANAGEMENT, {
      orderId: order.id,
      orderIri: order['@id'],
      initialTab: 'Tracking',
    });
  };

  const handleReorder = (order: Order) => {
    if (!token || isReordering) return;
    pendingReorderNavRef.current = true;
    dispatch({
      type: Types.REORDER_ORDER,
      payload: { order, token },
    });
  };

  const handleLeaveReview = (order: Order) => {
    navigation.navigate(ROUTES.LEAVE_REVIEW, {
      orderId: order.id,
      orderIri: order['@id'],
    });
  };

  const handleOrderAction = (order: Order) => {
    const status = normalizeOrderStatus(String(order.orderStatus));

    if (status === 'cancelled') {
      handleReorder(order);
      return;
    }

    if (isCompletedOrderStatus(order.orderStatus)) {
      handleLeaveReview(order);
      return;
    }

    handleTrackOrder(order);
  };

  useEffect(() => {
    if (!pendingReorderNavRef.current || isReordering) return;

    pendingReorderNavRef.current = false;
    if (!reorderError) {
      goToCartTab(navigation);
    }
  }, [isReordering, reorderError, navigation]);

  const handleMenuPress = (order: Order, anchor: MenuAnchor) => {
    setMenuOrder(order);
    setMenuAnchor(anchor);
  };

  const closeMenu = () => {
    setMenuAnchor(null);
    setMenuOrder(null);
  };

  const handleCancelMenuSelect = () => {
    if (!menuOrder) return;
    setOrderToCancel(menuOrder);
    setShowCancelSheet(true);
  };

  const handleConfirmCancel = () => {
    if (!orderToCancel?.id || !token) return;

    pendingCancelIdRef.current = Number(orderToCancel.id);
    setIsCancelling(true);
    dispatch({
      type: Types.CANCEL_ORDER,
      payload: { orderId: orderToCancel.id, token, suppressToast: true },
    });
  };

  const handleCancelSheetDismiss = () => {
    if (isCancelling && isLoading) return;
    setShowCancelSheet(false);
    setOrderToCancel(null);
    setIsCancelling(false);
    pendingCancelIdRef.current = null;
  };

  const handleDeleteMenuSelect = () => {
    if (!menuOrder) return;
    setOrderToDelete(menuOrder);
    setShowDeleteSheet(true);
  };

  const handleConfirmDelete = () => {
    if (!orderToDelete?.id || !token) return;

    pendingDeleteIdRef.current = Number(orderToDelete.id);
    setIsDeleting(true);
    dispatch({
      type: Types.DELETE_ORDER,
      payload: { orderId: orderToDelete.id, token, suppressToast: true },
    });
  };

  const handleDeleteSheetDismiss = () => {
    if (isDeleting && isLoading) return;
    setShowDeleteSheet(false);
    setOrderToDelete(null);
    setIsDeleting(false);
    pendingDeleteIdRef.current = null;
  };

  useEffect(() => {
    const pendingId = pendingDeleteIdRef.current;
    if (!isDeleting || isLoading || !pendingId) return;

    const stillExists = orders.some((order) => Number(order.id) === pendingId);
    if (!stillExists) {
      pendingDeleteIdRef.current = null;
      setIsDeleting(false);
      setShowDeleteSheet(false);
      setOrderToDelete(null);
      showFeedbackToast('Order deleted');
      return;
    }

    if (deleteError) {
      showBlockingError({
        title: 'Could not delete order',
        message: deleteError,
      });
      pendingDeleteIdRef.current = null;
      setIsDeleting(false);
      setShowDeleteSheet(false);
      setOrderToDelete(null);
    }
  }, [orders, isLoading, isDeleting, deleteError]);

  const menuItems = menuOrder
    ? canCancelOrderStatus(menuOrder.orderStatus)
      ? [
          {
            key: 'cancel',
            label: 'Cancel Order',
            icon: 'ban-outline',
            tone: 'danger' as const,
            onPress: handleCancelMenuSelect,
          },
        ]
      : isCancelledOrderStatus(menuOrder.orderStatus)
        ? [
            {
              key: 'delete',
              label: 'Delete Order',
              icon: 'trash-outline',
              tone: 'danger' as const,
              onPress: handleDeleteMenuSelect,
            },
          ]
        : []
    : [];

  return (
    <SafeAreaView className="flex-1 bg-app-bg" edges={['top']}>
      <Header
        title="My Order"
        leftVariant="logo"
        hideNotificationBell
        rightActions={[
          {
            icon: 'search-outline',
            onPress: () =>
              showBlockingInfo({
                title: 'Search Orders',
                message: 'Order search will be available in a future update.',
              }),
          },
          {
            icon: 'ellipsis-vertical',
            onPress: () =>
              showBlockingInfo({
                title: 'More Options',
                message: 'Additional order actions will be available soon.',
              }),
          },
        ]}
      />

      <View className="px-6 my-2 pb-2">
        <View
          className="flex-row bg-white border border-border-color p-1 rounded-2xl"
          style={mergeSurfaceCardStyle()}
        >
          {TABS.map((tab) => {
            const count = tabCounts[tab];
            const label = count > 0 ? `${tab} (${count})` : tab;

            return (
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
                  numberOfLines={1}
                >
                  {label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {isError && orders.length === 0 ? (
        <ErrorState error={error} context="orders" onRetry={fetchOrders} />
      ) : null}

      {isLoading && orders.length === 0 ? (
        <LoadingState message="Loading orders..." />
      ) : (
        <FlatList
          data={filteredOrders}
          keyExtractor={(item, index) => item.id?.toString() || index.toString()}
          renderItem={({ item }) => (
            <OrderCard
              item={item}
              onPress={handleOrderPress}
              onActionPress={handleOrderAction}
              onMenuPress={handleMenuPress}
              showMenu={activeTab === 'Active' || activeTab === 'Cancelled'}
            />
          )}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            { paddingHorizontal: 24, paddingTop: 10, paddingBottom: tabBarBottomPadding },
            filteredOrders.length === 0 && { flexGrow: 1, justifyContent: 'center' },
          ]}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#52622E']}
              tintColor="#52622E"
            />
          }
          ListEmptyComponent={
            <EmptyState
              iconName="cube-outline"
              title={orders.length > 0 ? `${activeTab} Orders` : 'No Orders Yet'}
              description={
                orders.length > 0
                  ? `You don't have any ${activeTab.toLowerCase()} orders at the moment.`
                  : "Looks like you haven't placed any orders yet. Start shopping to see them here!"
              }
              buttonText={orders.length === 0 ? 'Start Shopping' : undefined}
              onButtonPress={
                orders.length === 0 ? () => goToHomeTab(navigation) : undefined
              }
            />
          }
        />
      )}

      <AnchorActionMenu
        visible={Boolean(menuAnchor && menuItems.length > 0)}
        anchor={menuAnchor}
        items={menuItems}
        onClose={closeMenu}
      />

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
        onCancel={handleCancelSheetDismiss}
        onConfirm={handleConfirmCancel}
        isLoading={isCancelling && isLoading}
      />

      <SuccessBottomSheet
        visible={showSuccessSheet}
        message="Order Canceled Successfully!"
        onDismiss={() => setShowSuccessSheet(false)}
      />

      <ConfirmationBottomSheet
        visible={showDeleteSheet}
        title="Delete Order"
        titleTone="danger"
        message="Remove this cancelled order from your history?"
        cancelLabel="Cancel"
        confirmLabel="Delete Order"
        confirmVariant="danger"
        onCancel={handleDeleteSheetDismiss}
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting && isLoading}
      />
    </SafeAreaView>
  );
};

export default OrderScreen;
