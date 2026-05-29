import React from 'react';
import { View, Text, TouchableOpacity, Share, Modal, Pressable } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { showBlockingError } from '../../utils/userFeedback';

interface ProductShareSheetProps {
  visible: boolean;
  productName: string;
  shareMessage: string;
  onClose: () => void;
}

const SOCIAL_OPTIONS = [
  { id: 'whatsapp', label: 'WhatsApp', icon: 'logo-whatsapp', color: '#25D366' },
  { id: 'facebook', label: 'Facebook', icon: 'logo-facebook', color: '#1877F2' },
  { id: 'instagram', label: 'Instagram', icon: 'logo-instagram', color: '#E4405F' },
  { id: 'telegram', label: 'Telegram', icon: 'paper-plane', color: '#0088CC' },
  { id: 'twitter', label: 'Twitter', icon: 'logo-twitter', color: '#1DA1F2' },
] as const;

const ProductShareSheet: React.FC<ProductShareSheetProps> = ({
  visible,
  productName,
  shareMessage,
  onClose,
}) => {
  const insets = useSafeAreaInsets();

  const handleShare = async () => {
    try {
      await Share.share({ message: shareMessage, title: productName });
    } catch {
      showBlockingError({
        title: 'Share failed',
        message: 'Unable to open the share dialog.',
      });
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 justify-end">
        <Pressable className="absolute inset-0 bg-black/50" onPress={onClose} />
        <View
          className="bg-surface rounded-t-3xl"
          style={{ paddingBottom: Math.max(insets.bottom, 20) }}
        >
          <View className="items-center pt-3 pb-2">
            <View className="w-10 h-1 rounded-full bg-border-color" />
          </View>
          <Text className="text-center text-lg font-montserrat-bold text-dark-gray py-3">
            Share
          </Text>
          <View className="h-px bg-border-color" />

          <View className="px-6 py-5">
            <Text className="text-sm font-montserrat-bold text-dark-gray mb-3">
              Share via
            </Text>
            <View className="flex-row flex-wrap justify-between">
              {SOCIAL_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.id}
                  onPress={handleShare}
                  className="w-[18%] items-center mb-4"
                  activeOpacity={0.8}
                >
                  <View
                    className="w-12 h-12 rounded-full items-center justify-center mb-1.5"
                    style={{ backgroundColor: `${option.color}18` }}
                  >
                    <Icon name={option.icon} size={24} color={option.color} />
                  </View>
                  <Text className="text-[10px] font-montserrat text-gray text-center">
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              onPress={handleShare}
              className="mt-2 flex-row items-center justify-center bg-brand rounded-full py-3.5"
            >
              <Icon name="share-outline" size={20} color="#FFFFFF" />
              <Text className="text-white font-montserrat-bold ml-2">More options</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default ProductShareSheet;
