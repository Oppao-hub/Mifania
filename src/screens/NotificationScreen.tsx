import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  SectionList, 
  StatusBar 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { RootState, Notification } from '../utils/types';
import * as Types from '../app/actions';

const formatTime = (dateString: string) => {
  try {
      const date = new Date(dateString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch {
      return dateString;
  }
};

const NotificationItem = ({ item, onPress }: { item: Notification; onPress: (id: string | number) => void }) => (
  <TouchableOpacity 
    activeOpacity={0.7} 
    onPress={() => onPress(item.id)}
    className="flex-row mb-6 px-6"
  >
    {/* Left Icon */}
    <View className="w-14 h-14 rounded-full border border-gray-200 items-center justify-center mr-4">
      <Icon name={item.icon || 'bell-outline'} size={24} color="#111827" />
    </View>

    {/* Content */}
    <View className="flex-1">
      {/* Title Row */}
      <View className="flex-row items-center justify-between mb-1">
        <View className="flex-row items-center flex-1 pr-2">
          <Text className={`text-base ${!item.isRead ? 'font-bold' : 'font-semibold'} text-gray-900`} numberOfLines={1}>
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

      {/* Body Text (uses backend 'message') */}
      <Text className="text-sm text-gray-500 leading-5 mb-2">
        {item.message || item.body}
      </Text>

      {/* Time */}
      <Text className="text-[11px] font-medium text-gray-400">
        {formatTime(item.createdAt)}
      </Text>
    </View>
  </TouchableOpacity>
);

const SectionHeader = ({ section: { title, data } }: any) => {
  if (data.length === 0) return null;
  return (
      <View className="flex-row items-center px-6 mt-4 mb-6 bg-white">
      <Text className="text-sm font-medium text-gray-400 mr-4">
          {title}
      </Text>
      <View className="flex-1 h-[1px] bg-gray-100" />
      </View>
  );
};

const NotificationScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState<'General' | 'Promotions'>('General');
  const { items: notifications } = useSelector((state: RootState) => state.notification);

  // Filter notifications by tab
  const filteredNotifications = notifications.filter(n => {
    if (activeTab === 'General') {
        return n.type === 'system' || n.type === 'order' || n.type === 'General';
    }
    return n.type === 'Promotions' || n.type === 'marketing';
  });

  // Group notifications by "Recent"
  const sections = [
    {
      title: 'Recent',
      data: filteredNotifications,
    }
  ];

  const handleMarkAsRead = (id: number | string) => {
    dispatch({ type: Types.MARK_NOTIFICATION_READ, payload: id });
  };

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
        <Text className="text-xl font-bold text-gray-900">Notification</Text>
        <TouchableOpacity 
            onPress={() => dispatch({ type: Types.CLEAR_NOTIFICATIONS })}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Icon name="delete-outline" size={24} color="#111827" />
        </TouchableOpacity>
      </View>

      {/* CUSTOM SEGMENTED TABS */}
      <View className="px-6 mb-2 mt-2">
        <View className="flex-row bg-gray-100 p-1 rounded-xl">
          <TouchableOpacity 
            onPress={() => setActiveTab('General')}
            className={`flex-1 py-3 rounded-lg items-center ${
              activeTab === 'General' ? 'bg-[#52622E] shadow-sm' : 'bg-transparent'
            }`}
          >
            <Text className={`font-bold text-sm ${
              activeTab === 'General' ? 'text-white' : 'text-gray-500'
            }`}>
              General
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            onPress={() => setActiveTab('Promotions')}
            className={`flex-1 py-3 rounded-lg items-center ${
              activeTab === 'Promotions' ? 'bg-[#52622E] shadow-sm' : 'bg-transparent'
            }`}
          >
            <Text className={`font-bold text-sm ${
              activeTab === 'Promotions' ? 'text-white' : 'text-gray-500'
            }`}>
              Promotions
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* NOTIFICATIONS LIST */}
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <NotificationItem item={item} onPress={handleMarkAsRead} />}
        renderSectionHeader={SectionHeader}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
        stickySectionHeadersEnabled={false}
        ListEmptyComponent={() => (
            <View className="flex-1 items-center justify-center pt-20">
                <Icon name="bell-off-outline" size={60} color="#E5E7EB" />
                <Text className="text-gray-400 font-montserrat-medium mt-4">No notifications yet</Text>
            </View>
        )}
      />
    </SafeAreaView>
  );
};

export default NotificationScreen;