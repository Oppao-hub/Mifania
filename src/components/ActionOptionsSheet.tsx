import React from 'react';
import { View, Text, TouchableOpacity, Pressable } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ReusableOverlay from './ReusableOverlay';
import { getThemeColor } from '../theme';

export type ActionOption = {
  key: string;
  label: string;
  icon?: string;
  tone?: 'default' | 'danger';
  onPress: () => void;
};

interface ActionOptionsSheetProps {
  visible: boolean;
  title: string;
  options: ActionOption[];
  onClose: () => void;
}

const ActionOptionsSheet: React.FC<ActionOptionsSheetProps> = ({
  visible,
  title,
  options,
  onClose,
}) => {
  const insets = useSafeAreaInsets();

  return (
    <ReusableOverlay
      visible={visible}
      onClose={onClose}
      animationType="slide"
      position="bottom"
      backdropClassName="flex-1 bg-black/40 justify-end"
      contentClassName="w-full"
    >
      <Pressable onPress={(e) => e.stopPropagation()}>
        <View
          className="bg-surface rounded-t-3xl px-4 pt-4"
          style={{ paddingBottom: Math.max(insets.bottom, 20) }}
        >
          <View className="items-center pt-1 pb-3">
            <View className="w-10 h-1 rounded-full bg-border-color" />
          </View>

          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-lg font-montserrat-bold text-dark-gray">{title}</Text>
            <TouchableOpacity onPress={onClose} hitSlop={12}>
              <Icon name="close" size={24} color="#4B5563" />
            </TouchableOpacity>
          </View>

          <View className="h-px bg-border-color mb-2" />

          {options.map((option, index) => {
            const isDanger = option.tone === 'danger';
            const iconColor = isDanger
              ? getThemeColor('danger')
              : getThemeColor('brand.DEFAULT');
            const textClass = isDanger ? 'text-danger' : 'text-dark-gray';
            const isLast = index === options.length - 1;

            return (
              <TouchableOpacity
                key={option.key}
                activeOpacity={0.7}
                onPress={() => {
                  onClose();
                  option.onPress();
                }}
                className={`flex-row items-center py-4 ${
                  isLast ? '' : 'border-b border-border-color'
                }`}
              >
                {option.icon ? (
                  <Icon name={option.icon} size={20} color={iconColor} />
                ) : null}
                <Text
                  className={`text-base font-montserrat-medium ${textClass} ${
                    option.icon ? 'ml-3' : ''
                  }`}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </Pressable>
    </ReusableOverlay>
  );
};

export default ActionOptionsSheet;
