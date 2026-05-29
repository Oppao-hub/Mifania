import React from 'react';
import { Modal, View, Text } from 'react-native';
import Button from './Button';

interface ConfirmationModalProps {
    visible: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
    confirmText?: string;
    isDanger?: boolean;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ 
    visible, 
    title, 
    message, 
    onConfirm, 
    onCancel, 
    confirmText = "Confirm", 
    isDanger = false 
}) => {
  return (
    <Modal animationType="fade" transparent={true} visible={visible} onRequestClose={onCancel}>
      <View className="flex-1 justify-center items-center bg-black/60 px-6">
        <View className="w-full bg-white rounded-[30px] p-6 shadow-2xl">
          <Text className="text-xl font-bold text-brand-dark mb-2">{title}</Text>
          <Text className="text-gray text-base mb-8">{message}</Text>

          <View className="flex-row justify-between gap-x-4">
            <Button
              label="Cancel"
              onPress={onCancel}
              variant="secondary"
              size="sm"
              shape="square"
              fullWidth
              className="flex-1"
            />

            <Button
              label={confirmText}
              onPress={onConfirm}
              variant={isDanger ? 'danger' : 'primary'}
              size="sm"
              shape="square"
              fullWidth
              className="flex-1"
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default ConfirmationModal;