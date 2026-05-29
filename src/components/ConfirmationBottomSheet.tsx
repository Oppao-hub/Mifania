import React from 'react';
import { Modal, View, Text, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Button from './Button';

export type ConfirmationTitleTone = 'danger' | 'brand' | 'default';

export interface ConfirmationBottomSheetProps {
  visible: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
  titleTone?: ConfirmationTitleTone;
  description?: string;
  descriptionLinkText?: string;
  onDescriptionLinkPress?: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmVariant?: 'primary' | 'danger';
}

const titleToneClass: Record<ConfirmationTitleTone, string> = {
  danger: 'text-danger',
  brand: 'text-brand',
  default: 'text-dark-gray',
};

const ConfirmationBottomSheet: React.FC<ConfirmationBottomSheetProps> = ({
  visible,
  title,
  message,
  onConfirm,
  onCancel,
  isLoading = false,
  titleTone = 'danger',
  description,
  descriptionLinkText,
  onDescriptionLinkPress,
  confirmLabel = 'Yes, Confirm',
  cancelLabel = 'Cancel',
  confirmVariant = 'primary',
}) => {
  const insets = useSafeAreaInsets();

  const renderDescription = () => {
    if (!description) return null;

    if (!descriptionLinkText || !onDescriptionLinkPress) {
      return (
        <Text className="text-center text-sm font-montserrat text-gray px-8 pb-2 leading-5">
          {description}
        </Text>
      );
    }

    const parts = description.split(descriptionLinkText);
    if (parts.length < 2) {
      return (
        <Text className="text-center text-sm font-montserrat text-gray px-8 pb-2 leading-5">
          {description}
        </Text>
      );
    }

    return (
      <Text className="text-center text-sm font-montserrat text-gray px-8 pb-2 leading-5">
        {parts[0]}
        <Text className="text-brand font-montserrat-bold" onPress={onDescriptionLinkPress}>
          {descriptionLinkText}
        </Text>
        {parts.slice(1).join(descriptionLinkText)}
      </Text>
    );
  };

  return (
    <Modal
      animationType="slide"
      transparent
      visible={visible}
      onRequestClose={onCancel}
    >
      <View className="flex-1 justify-end">
        <Pressable
          className="absolute inset-0 bg-black/50"
          onPress={isLoading ? undefined : onCancel}
        />

        <View
          className="bg-white rounded-t-[28px] overflow-hidden"
          style={{ paddingBottom: Math.max(insets.bottom, 24) }}
        >
          <View className="items-center pt-3 pb-2">
            <View className="w-10 h-1 rounded-full bg-border-color" />
          </View>

          <Text
            className={`text-center text-lg font-montserrat-bold py-4 ${titleToneClass[titleTone]}`}
          >
            {title}
          </Text>
          <View className="h-px bg-border-color" />

          <Text className="text-center text-base font-montserrat-bold text-dark-gray px-6 pt-6 pb-3">
            {message}
          </Text>
          {renderDescription()}
          <View className="h-px bg-border-color mt-4" />

          <View className="flex-row gap-x-3 px-6 pt-6">
            <Button
              label={cancelLabel}
              onPress={onCancel}
              disabled={isLoading}
              variant="soft"
              size="sm"
              shape="pill"
              fullWidth={false}
              className="flex-1 min-w-0 px-3"
              textClassName="text-xs"
              numberOfLines={2}
            />

            <Button
              label={confirmLabel}
              onPress={onConfirm}
              disabled={isLoading}
              isLoading={isLoading}
              variant={confirmVariant}
              size="sm"
              shape="pill"
              fullWidth={false}
              className="flex-1 min-w-0 px-3"
              textClassName="text-xs"
              numberOfLines={2}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default ConfirmationBottomSheet;
