import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { Notification } from '../utils/types';
import {
  formatNotificationTimestamp,
  getNotificationEmoji,
  getNotificationIcon,
} from '../utils/notificationPresentation';

interface NotificationItemProps {
  item: Notification;
  onPress: (item: Notification) => void;
  onDelete: (item: Notification) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({ item, onPress, onDelete }) => {
  const emoji = getNotificationEmoji(item);
  const iconName = getNotificationIcon(item);
  const body = item.message || item.body || '';

  return (
    <View className="relative px-6 py-4">
      <TouchableOpacity
        onPress={() => onDelete(item)}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        className="absolute top-4 right-6 z-10"
        accessibilityLabel="Delete notification"
        accessibilityRole="button"
      >
        <Icon name="close" size={14} color="#F87171" />
      </TouchableOpacity>

      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => onPress(item)}
        className="flex-row items-start min-w-0 pr-5"
      >
        <View className="w-12 h-12 rounded-full border border-border-color bg-white items-center justify-center mr-4">
          <Icon name={iconName} size={22} color="#6A7282" />
        </View>

        <View className="flex-1 min-w-0 pr-3">
          <View className="flex-row items-start">
            <Text
              className={`flex-1 text-[15px] font-montserrat-bold text-dark-gray pr-2 ${
                !item.isRead ? '' : 'opacity-80'
              }`}
              numberOfLines={2}
            >
              {item.title}
              {emoji ? ` ${emoji}` : ''}
            </Text>

            {!item.isRead ? (
              <View className="w-2 h-2 rounded-full bg-brand mt-1.5" />
            ) : null}
          </View>

          {body ? (
            <Text
              className={`text-sm font-montserrat leading-5 mt-1.5 ${
                !item.isRead ? 'text-gray' : 'text-gray/80'
              }`}
              numberOfLines={3}
            >
              {body}
            </Text>
          ) : null}

          <Text className="text-[11px] font-montserrat text-gray mt-2">
            {formatNotificationTimestamp(item.createdAt)}
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default NotificationItem;
