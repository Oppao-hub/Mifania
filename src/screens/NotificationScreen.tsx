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

const formatNotificationTime = (dateString: string) => {
  try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
      
      if (diffInHours < 1) {
          const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
          return diffInMinutes <= 1 ? 'Just now' : `${diffInMinutes}m ago`;
      } else if (diffInHours < 24 && date.getDate() === now.getDate()) {
          return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      } else if (diffInHours < 48 && new Date(now.setDate(now.getDate() - 1)).getDate() === date.getDate()) {
          return 'Yesterday';
      } else {
          return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
      }
  } catch {
      return dateString;
  }
};

const NotificationItem = ({ item, onPress }: { item: Notification; onPress: (item: Notification) => void }) => (
  <TouchableOpacity 
    activeOpacity={0.7} 
    onPress={() => onPress(item)}
    className="flex-row mb-6 px-6"
  >
    {/* Left Icon */}
    <View className={`w-14 h-14 rounded-full border ${!item.isRead ? 'border-[#52622E] bg-[#52622E]/5' : 'border-gray-100 bg-gray-50'} items-center justify-center mr-4`}>
      <Icon name={item.icon || 'bell-outline'} size={24} color={!item.isRead ? '#52622E' : '#9CA3AF'} />
    </View>

    {/* Content */}
    <View className="flex-1">
      {/* Title Row */}
      <View className="flex-row items-center justify-between mb-1">
        <View className="flex-row items-center flex-1 pr-2">
          <Text className={`text-base ${!item.isRead ? 'font-bold text-gray-900' : 'font-medium text-gray-600'}`} numberOfLines={1}>
            {item.title} {item.emoji}
          </Text>
        </View>
        
        <View className="flex-row items-center">
          {!item.isRead && (
            <View className="w-2.5 h-2.5 rounded-full bg-[#52622E] mr-3" />
          )}
          <Icon name="chevron-right" size={20} color="#9CA3AF" />
        </View>
      </View>

      {/* Body Text */}
      <Text className={`text-sm ${!item.isRead ? 'text-gray-700' : 'text-gray-400'} leading-5 mb-2`} numberOfLines={2}>
        {item.message || item.body}
      </Text>

      {/* Time */}
      <Text className="text-[11px] font-medium text-gray-400">
        {formatNotificationTime(item.createdAt)}
      </Text>
    </View>
  </TouchableOpacity>
);

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
  const [activeTab, setActiveTab] = useState<'General' | 'Promotions'>('General');
  const { items: notifications } = useSelector((state: RootState) => state.notification);
  const { data: authData } = useSelector((state: RootState) => state.authentication);
  const token = authData?.token;

  useFocusEffect(
    useCallback(() => {
        if (token) {
            dispatch({ type: Types.GET_NOTIFICATIONS, payload: token });
        }
    }, [token, dispatch])
  );

  const filteredNotifications = useMemo(() => {
    return notifications.filter(n => {
        if (activeTab === 'General') {
            return n.type === 'system' || n.type === 'order' || n.type === 'General';
        }
        return n.type === 'Promotions' || n.type === 'marketing';
      });
  }, [notifications, activeTab]);

  const sections = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const todayData: Notification[] = [];
    const yesterdayData: Notification[] = [];
    const olderData: Notification[] = [];

    filteredNotifications.forEach(n => {
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
  }, [filteredNotifications]);

  const handleNotificationPress = (item: Notification) => {
    dispatch({ type: Types.MARK_NOTIFICATION_READ, payload: item.id });
    
    if (item.targetUrl) {
        // If targetUrl is a route name, navigate to it
        // If it's something else, handle accordingly
        try {
            navigation.navigate(item.targetUrl as any);
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

  const hasUnread = filteredNotifications.some(n => !n.isRead);

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <StatusBar barStyle="dark-content" />

      {/* HEADER */}
      <View className="flex-row items-center justify-between px-6 py-4">
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

      {/* CUSTOM SEGMENTED TABS */}
      <View className="px-6 mb-4 mt-2">
        <View className="flex-row bg-gray-50 p-1.5 rounded-2xl border border-gray-100">
          <TouchableOpacity 
            onPress={() => setActiveTab('General')}
            className={`flex-1 py-3 rounded-xl items-center ${
              activeTab === 'General' ? 'bg-white shadow-sm border border-gray-100' : 'bg-transparent'
            }`}
          >
            <Text className={`font-bold text-sm ${
              activeTab === 'General' ? 'text-[#52622E]' : 'text-gray-400'
            }`}>
              General
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            onPress={() => setActiveTab('Promotions')}
            className={`flex-1 py-3 rounded-xl items-center ${
              activeTab === 'Promotions' ? 'bg-white shadow-sm border border-gray-100' : 'bg-transparent'
            }`}
          >
            <Text className={`font-bold text-sm ${
              activeTab === 'Promotions' ? 'text-[#52622E]' : 'text-gray-400'
            }`}>
              Promotions
            </Text>
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
        ListEmptyComponent={() => (
            <View className="flex-1 items-center justify-center pt-20 px-10">
                <View className="w-24 h-24 bg-gray-50 rounded-full items-center justify-center mb-6">
                    <Icon name="bell-off-outline" size={48} color="#D1D5DB" />
                </View>
                <Text className="text-xl font-bold text-gray-900 mb-2 text-center">No notifications yet</Text>
                <Text className="text-gray-400 text-center leading-5">
                    We'll notify you when something important happens or when there's a new promotion.
                </Text>
            </View>
        )}
      />
    </SafeAreaView>
  );
};

export default NotificationScreen;
