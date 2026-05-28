import React from 'react';
import { Modal, Pressable, View } from 'react-native';

type OverlayPosition = 'center' | 'bottom';

interface ReusableOverlayProps {
  visible: boolean;
  children: React.ReactNode;
  onClose?: () => void;
  closeOnBackdropPress?: boolean;
  animationType?: 'none' | 'slide' | 'fade';
  position?: OverlayPosition;
  backdropClassName?: string;
  contentClassName?: string;
  statusBarTranslucent?: boolean;
}

const ReusableOverlay: React.FC<ReusableOverlayProps> = ({
  visible,
  children,
  onClose,
  closeOnBackdropPress = true,
  animationType = 'fade',
  position = 'center',
  backdropClassName,
  contentClassName,
  statusBarTranslucent = true,
}) => {
  const positionClassName =
    position === 'bottom' ? 'justify-end items-stretch' : 'justify-center items-center';

  return (
    <Modal
      visible={visible}
      transparent
      animationType={animationType}
      onRequestClose={onClose}
      statusBarTranslucent={statusBarTranslucent}
    >
      <Pressable
        className={`${backdropClassName ?? 'flex-1 bg-black/50'} ${positionClassName}`}
        onPress={closeOnBackdropPress ? onClose : undefined}
      >
        <View
          className={contentClassName}
          onStartShouldSetResponder={() => true}
        >
          {children}
        </View>
      </Pressable>
    </Modal>
  );
};

export default ReusableOverlay;
