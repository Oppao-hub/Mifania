import React from 'react';
import { View, Text, TouchableOpacity, Pressable } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ReusableOverlay from './ReusableOverlay';

export interface CatalogOption<T extends string = string> {
  value: T;
  label: string;
}

interface CatalogOptionsSheetProps<T extends string> {
  visible: boolean;
  title: string;
  options: CatalogOption<T>[];
  selectedValue: T | null;
  onSelect: (value: T) => void;
  onClose: () => void;
}

function CatalogOptionsSheet<T extends string>({
  visible,
  title,
  options,
  selectedValue,
  onSelect,
  onClose,
}: CatalogOptionsSheetProps<T>) {
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
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-lg font-montserrat-bold text-dark-gray">{title}</Text>
            <TouchableOpacity onPress={onClose} hitSlop={12}>
              <Icon name="close" size={24} color="#4B5563" />
            </TouchableOpacity>
          </View>

          {options.map((option) => {
            const isSelected = selectedValue === option.value;
            return (
              <TouchableOpacity
                key={option.value}
                onPress={() => {
                  onSelect(option.value);
                  onClose();
                }}
                className={`flex-row items-center justify-between py-4 border-b border-border-color ${
                  isSelected ? 'bg-row-hover -mx-4 px-4 rounded-lg' : ''
                }`}
                activeOpacity={0.7}
              >
                <Text
                  className={`text-base font-montserrat ${
                    isSelected ? 'text-brand font-montserrat-bold' : 'text-dark-gray'
                  }`}
                >
                  {option.label}
                </Text>
                {isSelected ? <Icon name="checkmark-circle" size={22} color="#52622E" /> : null}
              </TouchableOpacity>
            );
          })}
        </View>
      </Pressable>
    </ReusableOverlay>
  );
}

export default CatalogOptionsSheet;
