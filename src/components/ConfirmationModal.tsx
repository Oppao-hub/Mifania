import React from 'react';
import { Modal, View, Text, TouchableOpacity } from 'react-native';

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
            <TouchableOpacity 
              onPress={onCancel}
              className="flex-1 h-12 border border-gray-300 rounded-xl justify-center items-center"
            >
              <Text className="text-gray-600 font-bold text-base">Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={onConfirm}
              // If isDanger is true, we use a red background instead of the brand color
              className={`flex-1 h-12 rounded-xl justify-center items-center ${isDanger ? 'bg-red-500' : 'bg-brand'}`}
            >
              <Text className="text-white font-bold text-base">{confirmText}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default ConfirmationModal;