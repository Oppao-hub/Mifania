import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SectionList,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { useScreenLiveSync } from '../hooks/useLiveSync';
import { LIVE_SYNC_POLL_MS } from '../config/realtime';
import { RootState, Notification } from '../utils/types';
import * as Types from '../app/actions';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ROUTES } from '../utils';
import Header from '../components/Header';
import NotificationItem from '../components/NotificationItem';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';
import LoadingState from '../components/LoadingState';
import ConfirmationBottomSheet from '../components/ConfirmationBottomSheet';
import ActionOptionsSheet from '../components/ActionOptionsSheet';
import {
  filterNotificationsByTab,
  NotificationTab,
} from '../utils/notificationPresentation';
import { shouldShowFetchError } from '../utils/fetchError';

const SectionHeader = ({ section: { title, data } }: { section: { title: string; data: Notification[] } }) => {
  if (data.length === 0) return null;

  return (
    <View className="flex-row items-center px-6 mt-5 mb-2">
      <Text className="text-sm font-montserrat text-gray mr-3">{title}</Text>
      <View className="flex-1 h-px bg-border-color" />
    </View>
  );
};

const NotificationScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const dispatch = useDispatch();
  const {
    items: notifications,
    isLoading,
    error: notificationsError,
  } = useSelector((state: RootState) => state.notification);
  const { data: authData } = useSelector((state: RootState) => state.authentication);
  const token = authData?.token;

  const [activeTab, setActiveTab] = useState<NotificationTab>('General');
  const [refreshing, setRefreshing] = useState(false);
  const [notificationToDelete, setNotificationToDelete] = useState<Notification | null>(null);
  const [showClearAllSheet, setShowClearAllSheet] = useState(false);
  const [showSettingsSheet, setShowSettingsSheet] = useState(false);

  const reloadNotifications = useCallback(() => {
    if (token) {
      dispatch({ type: Types.GET_NOTIFICATIONS });
    }
  }, [token, dispatch]);

  useScreenLiveSync(reloadNotifications, LIVE_SYNC_POLL_MS, Boolean(token));

  const onRefresh = useCallback(() => {
    if (!token) return;
    setRefreshing(true);
    dispatch({ type: Types.GET_NOTIFICATIONS });
    setTimeout(() => setRefreshing(false), 800);
  }, [token, dispatch]);

  const showFetchError = shouldShowFetchError({
    isLoading: isLoading && (notifications?.length ?? 0) === 0,
    error: notificationsError,
    hasData: (notifications?.length ?? 0) > 0,
  });

  const filteredNotifications = useMemo(
    () => filterNotificationsByTab(notifications || [], activeTab),
    [notifications, activeTab],
  );

  const sections = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const todayData: Notification[] = [];
    const yesterdayData: Notification[] = [];
    const olderData: Notification[] = [];

    const sorted = [...filteredNotifications].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    sorted.forEach((notification) => {
      const date = new Date(notification.createdAt);
      date.setHours(0, 0, 0, 0);

      if (date.getTime() === today.getTime()) {
        todayData.push(notification);
      } else if (date.getTime() === yesterday.getTime()) {
        yesterdayData.push(notification);
      } else {
        olderData.push(notification);
      }
    });

    const result: { title: string; data: Notification[] }[] = [];
    if (todayData.length > 0) result.push({ title: 'Today', data: todayData });
    if (yesterdayData.length > 0) result.push({ title: 'Yesterday', data: yesterdayData });
    if (olderData.length > 0) result.push({ title: 'Earlier', data: olderData });

    return result;
  }, [filteredNotifications]);

  const getOrderReference = (item: Notification): { orderId?: number; orderIri?: string } => {
    const payloadOrderId = Number((item as Notification & { orderId?: number }).orderId);
    if (!Number.isNaN(payloadOrderId) && payloadOrderId > 0) {
      return {
        orderId: payloadOrderId,
        orderIri: `/api/orders/${payloadOrderId}`,
      };
    }

    const sourceText = `${item.targetUrl || ''} ${item.message || ''} ${item.body || ''}`;
    const orderIriMatch = sourceText.match(/(\/api\/orders\/\d+)/i);
    if (orderIriMatch?.[1]) {
      const iri = orderIriMatch[1];
      const idFromIri = Number(iri.match(/(\d+)$/)?.[1]);
      return {
        orderIri: iri,
        orderId: Number.isNaN(idFromIri) ? undefined : idFromIri,
      };
    }

    const orderPathMatch = sourceText.match(/\/orders?\/(\d+)/i);
    if (orderPathMatch?.[1]) {
      const id = Number(orderPathMatch[1]);
      if (!Number.isNaN(id)) return { orderId: id };
    }

    const orderNumberMatch = sourceText.match(/order\s*#?\s*(\d+)/i);
    if (orderNumberMatch?.[1]) {
      const id = Number(orderNumberMatch[1]);
      if (!Number.isNaN(id)) return { orderId: id };
    }

    return {};
  };

  const isOrderRelatedNotification = (item: Notification): boolean => {
    const sourceText = `${item.type || ''} ${item.title || ''} ${item.targetUrl || ''} ${item.message || ''} ${item.body || ''}`.toLowerCase();
    return (
      sourceText.includes('order') ||
      sourceText.includes('tracking') ||
      sourceText.includes('shipped') ||
      sourceText.includes('delivered') ||
      sourceText.includes('cancelled')
    );
  };

  const handleNotificationPress = (item: Notification) => {
    if (item.id != null) {
      dispatch({
        type: Types.MARK_NOTIFICATION_READ,
        payload: {
          id: Number(item.id),
          token,
        },
      });
    }

    try {
      const url = String(item.targetUrl || '').toLowerCase();
      const isOrderNotification = isOrderRelatedNotification(item);

      if (isOrderNotification) {
        const { orderId, orderIri } = getOrderReference(item);
        if (orderId || orderIri) {
          navigation.navigate(ROUTES.ORDER_MANAGEMENT as any, {
            orderId,
            orderIri,
            initialTab: 'Tracking',
          });
        } else {
          navigation.navigate('BottomTab' as any, {
            screen: 'My Order',
          });
        }
        return;
      }

      if (url.includes('/account') || String(item.type || '').toLowerCase() === 'security') {
        navigation.navigate('BottomTab' as any, {
          screen: 'Account',
        });
      } else if (url.includes('/cart')) {
        navigation.navigate('BottomTab' as any, {
          screen: 'Cart',
        });
      } else if (item.targetUrl) {
        navigation.navigate(item.targetUrl as any);
      }
    } catch (error) {
      console.error('Navigation error:', error);
    }
  };

  const handleMarkAllRead = () => {
    dispatch({ type: Types.MARK_ALL_NOTIFICATIONS_READ, payload: { token } });
  };

  const handleDeleteNotification = (item: Notification) => {
    setNotificationToDelete(item);
  };

  const handleConfirmDeleteNotification = () => {
    const id = Number(notificationToDelete?.id);
    if (Number.isNaN(id)) {
      setNotificationToDelete(null);
      return;
    }

    dispatch({
      type: Types.DELETE_NOTIFICATION,
      payload: { id, token },
    });
    setNotificationToDelete(null);
  };

  const handleClearAll = () => {
    setShowClearAllSheet(true);
  };

  const handleConfirmClearAll = () => {
    dispatch({
      type: Types.CLEAR_NOTIFICATIONS,
      payload: { token },
    });
    setShowClearAllSheet(false);
  };

  const hasUnread = (notifications || []).some((item) => !item.isRead);

  const settingsOptions = [
    ...(hasUnread
      ? [
          {
            key: 'mark-read',
            label: 'Mark all as read',
            icon: 'checkmark-done-outline',
            onPress: handleMarkAllRead,
          },
        ]
      : []),
    {
      key: 'clear-all',
      label: 'Clear all notifications',
      icon: 'trash-outline',
      tone: 'danger' as const,
      onPress: handleClearAll,
    },
  ];

  const emptyTitle =
    activeTab === 'Promotions' ? 'No promotions yet' : 'No notifications yet';
  const emptyDescription =
    activeTab === 'Promotions'
      ? "We'll let you know when there are deals, rewards, and special offers for you."
      : "We'll notify you when something important happens with your account or orders.";

  return (
    <SafeAreaView className="flex-1 bg-app-bg" edges={['top']}>
      <Header
        title="Notification"
        hideNotificationBell
        rightActions={[
          {
            icon: 'settings-outline',
            onPress: () => setShowSettingsSheet(true),
          },
        ]}
      />

      <View className="px-6 mb-2">
        <View className="flex-row bg-white border border-border-color p-1 rounded-2xl shadow-sm">
          {(['General', 'Promotions'] as NotificationTab[]).map((tab) => (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTab(tab)}
              className={`flex-1 py-2.5 rounded-xl items-center ${
                activeTab === tab ? 'bg-brand' : 'bg-transparent'
              }`}
            >
              <Text
                className={`font-montserrat-bold text-[13px] ${
                  activeTab === tab ? 'text-white' : 'text-gray'
                }`}
              >
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {showFetchError ? (
        <ErrorState
          error={notificationsError}
          context="notifications"
          onRetry={reloadNotifications}
        />
      ) : isLoading && (notifications?.length ?? 0) === 0 ? (
        <LoadingState message="Loading notifications..." />
      ) : (
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id?.toString() ?? `${item.createdAt}-${item.title}`}
        renderItem={({ item }) => (
          <NotificationItem
            item={item}
            onPress={handleNotificationPress}
            onDelete={handleDeleteNotification}
          />
        )}
        renderSectionHeader={({ section }) => <SectionHeader section={section} />}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 40,
          flexGrow: sections.length === 0 ? 1 : undefined,
        }}
        stickySectionHeadersEnabled={false}
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
            iconName="bell-off-outline"
            title={emptyTitle}
            description={emptyDescription}
          />
        }
      />
      )}

      <ConfirmationBottomSheet
        visible={notificationToDelete !== null}
        title="Delete Notification"
        titleTone="danger"
        message={
          notificationToDelete
            ? `Remove "${notificationToDelete.title}" from your notifications?`
            : ''
        }
        cancelLabel="Cancel"
        confirmLabel="Delete"
        confirmVariant="danger"
        onCancel={() => setNotificationToDelete(null)}
        onConfirm={handleConfirmDeleteNotification}
      />

      <ActionOptionsSheet
        visible={showSettingsSheet}
        title="Notification Settings"
        options={settingsOptions}
        onClose={() => setShowSettingsSheet(false)}
      />

      <ConfirmationBottomSheet
        visible={showClearAllSheet}
        title="Clear Notifications"
        titleTone="danger"
        message="Are you sure you want to delete all notifications?"
        cancelLabel="Cancel"
        confirmLabel="Delete All"
        confirmVariant="danger"
        onCancel={() => setShowClearAllSheet(false)}
        onConfirm={handleConfirmClearAll}
        isLoading={isLoading}
      />
    </SafeAreaView>
  );
};

export default NotificationScreen;
