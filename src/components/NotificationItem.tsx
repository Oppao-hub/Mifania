import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Notification } from '../utils/types';

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

interface NotificationItemProps {
    item: Notification;
    onPress: (item: Notification) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({ item, onPress }) => (
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

export default NotificationItem;