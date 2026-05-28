// src/screens/NotificationScreen.tsx
import React, { useState, useMemo, useCallback } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  SectionList, 
  StatusBar,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { RootState, Notification } from '../utils/types';
import * as Types from '../app/actions';
import { StackNavigationProp } from '@react-navigation/stack';
import { ROUTES } from '../utils';

// 💡 Import the new component
import NotificationItem from '../components/NotificationItem';

const SectionHeader = ({ section: { title, data } }: any) => {
  if (data.length === 0) return null;
  return (
      <View className="flex-row items-center px-6 mt-4 mb-6 bg-white">
        <Text className="text-xs font-bold text-gray-400 uppercase tracking-widest mr-4">
            {title}
        </Text>
        <View className="flex-1 h-[0.5px] bg-gray-100" />
      </View>
  );
};

const NotificationScreen = () => {
  const navigation = useNavigation<StackNavigationProp<any>>();
  const dispatch = useDispatch();
  const { items: notifications } = useSelector((state: RootState) => state.notification);
  const { data: authData } = useSelector((state: RootState) => state.authentication);
  const token = authData?.token;
  
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
        if (token) {
            dispatch({ type: Types.GET_NOTIFICATIONS, payload: token });
        }
    }, [token, dispatch])
  );

  const onRefresh = useCallback(() => {
    if (token) {
      setRefreshing(true);
      dispatch({ type: Types.GET_NOTIFICATIONS, payload: token });
      setTimeout(() => setRefreshing(false), 800);
    }
  }, [token, dispatch]);

  const getOrderReference = (item: Notification): { orderId?: number; orderIri?: string } => {
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

  const sections = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const todayData: Notification[] = [];
    const yesterdayData: Notification[] = [];
    const olderData: Notification[] = [];

    const safeNotifications = notifications || [];

    safeNotifications.forEach(n => {
        const date = new Date(n.createdAt);
        date.setHours(0, 0, 0, 0);

        if (date.getTime() === today.getTime()) {
            todayData.push(n);
        } else if (date.getTime() === yesterday.getTime()) {
            yesterdayData.push(n);
        } else {
            olderData.push(n);
        }
    });

    const result = [];
    if (todayData.length > 0) result.push({ title: 'Today', data: todayData });
    if (yesterdayData.length > 0) result.push({ title: 'Yesterday', data: yesterdayData });
    if (olderData.length > 0) result.push({ title: 'Older', data: olderData });

    return result;
  }, [notifications]);

  
  const handleNotificationPress = (item: Notification) => {
    dispatch({ type: Types.MARK_NOTIFICATION_READ, payload: item.id });
    
    if (item.targetUrl) {
        try {
            const url = item.targetUrl.toLowerCase();

            // 💡 Nested Navigation Logic
            // We navigate to 'BottomTab' (the navigator name) 
            // and pass the 'screen' param (the specific tab name)
            if (url.includes('/account')) {
                navigation.navigate('BottomTab' as any, { 
                    screen: 'Account' 
                });
            } 
            else if (url.includes('/order') || url.includes('order')) {
                const { orderId, orderIri } = getOrderReference(item);
                if (orderId || orderIri) {
                    navigation.navigate(ROUTES.ORDER_MANAGEMENT as any, {
                        orderId,
                        orderIri,
                        initialTab: 'Tracking',
                    });
                } else {
                    navigation.navigate('BottomTab' as any, { 
                        screen: 'My Order' 
                    });
                }
            }
            else if (url.includes('/cart')) {
                navigation.navigate('BottomTab' as any, { 
                    screen: 'Cart' 
                });
            }
            else {
                // If the URL is just a simple screen name defined in MainNavigator
                navigation.navigate(item.targetUrl as any);
            }
        } catch (e) {
            console.error("Navigation error:", e);
        }
    }
  };

  const handleMarkAllRead = () => {
    dispatch({ type: Types.MARK_ALL_NOTIFICATIONS_READ });
  };

  const handleClearAll = () => {
    Alert.alert(
        "Clear Notifications",
        "Are you sure you want to delete all notifications?",
        [
            { text: "Cancel", style: "cancel" },
            { 
                text: "Delete", 
                style: "destructive", 
                onPress: () => dispatch({ type: Types.CLEAR_NOTIFICATIONS }) 
            }
        ]
    );
  };

  const hasUnread = (notifications || []).some(n => !n.isRead);

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <StatusBar barStyle="dark-content" />

      {/* HEADER */}
      <View className="flex-row items-center justify-between px-6 py-4 mb-2">
        <TouchableOpacity 
            onPress={() => navigation.goBack()}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Icon name="arrow-left" size={24} color="#111827" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-gray-900">Notifications</Text>
        <View className="flex-row">
            {hasUnread && (
                <TouchableOpacity 
                    onPress={handleMarkAllRead}
                    className="mr-4"
                    hitSlop={{ top: 10, bottom: 10, left: 5, right: 5 }}
                >
                    <Icon name="check-all" size={24} color="#52622E" />
                </TouchableOpacity>
            )}
            <TouchableOpacity 
                onPress={handleClearAll}
                hitSlop={{ top: 10, bottom: 10, left: 5, right: 5 }}
            >
                <Icon name="delete-outline" size={24} color="#111827" />
            </TouchableOpacity>
        </View>
      </View>

      {/* NOTIFICATIONS LIST */}
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id?.toString() ?? Math.random().toString()}
        renderItem={({ item }) => <NotificationItem item={item} onPress={handleNotificationPress} />}
        renderSectionHeader={SectionHeader}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
        stickySectionHeadersEnabled={false}
        refreshing={refreshing}
        onRefresh={onRefresh}
        ListEmptyComponent={() => (
            <View className="flex-1 items-center justify-center pt-20 px-10">
                <View className="w-24 h-24 bg-gray-50 rounded-full items-center justify-center mb-6">
                    <Icon name="bell-off-outline" size={48} color="#D1D5DB" />
                </View>
                <Text className="text-xl font-bold text-gray-900 mb-2 text-center">No notifications yet</Text>
                <Text className="text-gray-400 text-center leading-5">
                    We'll notify you when something important happens with your account or orders.
                </Text>
            </View>
        )}
      />
    </SafeAreaView>
  );
};

export default NotificationScreen;