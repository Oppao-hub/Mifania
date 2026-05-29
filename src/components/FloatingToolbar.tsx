import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { mergeSurfaceCardStyle } from '../utils/cardStyles';

export type FloatingToolbarAction = {
  key: string;
  label: string;
  icon: string;
  onPress: () => void;
};

interface FloatingToolbarProps {
  actions: FloatingToolbarAction[];
  bottomOffset: number;
}

const FloatingToolbar: React.FC<FloatingToolbarProps> = ({ actions, bottomOffset }) => (
  <View
    pointerEvents="box-none"
    className="absolute left-0 right-0 items-center px-6"
    style={{ bottom: bottomOffset }}
  >
    <View className="flex-row items-center gap-3">
      {actions.map((action) => (
        <TouchableOpacity
          key={action.key}
          activeOpacity={0.85}
          onPress={action.onPress}
          className="flex-row items-center rounded-full border border-border-color bg-white px-5 py-3 shadow-sm"
          style={mergeSurfaceCardStyle()}
        >
          <Icon name={action.icon} size={18} color="#4B5563" />
          <Text className="ml-2 text-sm font-montserrat-bold text-dark-gray">{action.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  </View>
);

export default FloatingToolbar;
