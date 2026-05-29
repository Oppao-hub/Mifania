import React, { useEffect } from 'react';
import { Modal, View, Text, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';

export interface SuccessBottomSheetProps {
  visible: boolean;
  message: string;
  onDismiss: () => void;
  autoDismissMs?: number;
}

const SuccessBottomSheet: React.FC<SuccessBottomSheetProps> = ({
  visible,
  message,
  onDismiss,
  autoDismissMs = 2200,
}) => {
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (!visible || !autoDismissMs) return undefined;

    const timer = setTimeout(onDismiss, autoDismissMs);
    return () => clearTimeout(timer);
  }, [visible, autoDismissMs, onDismiss]);

  return (
    <Modal
      animationType="slide"
      transparent
      visible={visible}
      onRequestClose={onDismiss}
    >
      <View className="flex-1 justify-end">
        <Pressable className="absolute inset-0 bg-black/50" onPress={onDismiss} />

        <View
          className="bg-white rounded-t-[28px] overflow-hidden items-center px-6"
          style={{ paddingBottom: Math.max(insets.bottom, 32), paddingTop: 12 }}
        >
          <View className="items-center pt-3 pb-4">
            <View className="w-10 h-1 rounded-full bg-border-color" />
          </View>

          <View className="w-20 h-20 rounded-full bg-brand items-center justify-center mb-6">
            <Icon name="checkmark" size={42} color="#FFFFFF" />
          </View>

          <Text className="text-center text-lg font-montserrat-bold text-dark-gray pb-4">
            {message}
          </Text>
        </View>
      </View>
    </Modal>
  );
};

export default SuccessBottomSheet;
