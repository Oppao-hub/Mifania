import React from 'react';
import { 
  Modal, 
  View, 
  Text, 
  TouchableOpacity, 
  Pressable, 
  ActivityIndicator, 
  StyleSheet 
} from 'react-native';
import { LucideIcon } from 'lucide-react-native';

interface CustomModalProps {
  visible: boolean;
  onClose?: () => void;
  title?: string;
  message?: string;
  icon?: LucideIcon;
  iconColor?: string;
  children?: React.ReactNode;
  primaryButtonText?: string;
  onPrimaryAction?: () => void;
  secondaryButtonText?: string;
  onSecondaryAction?: () => void;
  isLoading?: boolean;
  type?: 'default' | 'danger' | 'success';
}

/**
 * A highly reusable Modal component for Mifania.
 * Supports: Alerts, Confirmations, Custom Content, and Loading states.
 */
const CustomModal: React.FC<CustomModalProps> = ({
  visible,
  onClose,
  title,
  message,
  icon: Icon,
  iconColor,
  children,
  primaryButtonText,
  onPrimaryAction,
  secondaryButtonText,
  onSecondaryAction,
  isLoading = false,
  type = 'default',
}) => {
  
  // Determine button color based on type
  const getPrimaryBtnColor = () => {
    if (type === 'danger') return 'bg-danger';
    if (type === 'success') return 'bg-success';
    return 'bg-brand';
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      {/* Backdrop */}
      <Pressable 
        onPress={isLoading ? undefined : onClose} 
        style={StyleSheet.absoluteFill}
        className="flex-1 justify-center items-center bg-black/50 px-6"
      >
        {/* Modal Card - Pressable to stop propagation */}
        <Pressable 
          className="w-full bg-white rounded-[35px] p-8 shadow-2xl items-center"
          onPress={(e) => e.stopPropagation()}
        >
          
          {isLoading ? (
            <View className="py-4 items-center">
              <ActivityIndicator size="large" color="#52622E" />
              <Text className="mt-4 text-brand-dark font-montserrat-bold text-base">
                {message || 'Please wait...'}
              </Text>
            </View>
          ) : (
            <>
              {/* Optional Icon */}
              {Icon && (
                <View className="mb-5 p-5 rounded-full bg-light-gray">
                  <Icon size={35} color={iconColor || (type === 'danger' ? '#DC3545' : '#52622E')} />
                </View>
              )}

              {/* Title */}
              {title && (
                <Text className="text-xl font-montserrat-bold text-brand-dark mb-2 text-center">
                  {title}
                </Text>
              )}

              {/* Message */}
              {message && (
                <Text className="text-gray text-base font-montserrat mb-6 text-center leading-6">
                  {message}
                </Text>
              )}

              {/* Dynamic Content (Inputs, Forms, etc.) */}
              {children && (
                <View className="w-full mb-6">
                  {children}
                </View>
              )}

              {/* Action Buttons */}
              <View className="w-full gap-y-3">
                {primaryButtonText && (
                  <TouchableOpacity
                    onPress={onPrimaryAction}
                    activeOpacity={0.8}
                    className={`w-full h-14 ${getPrimaryBtnColor()} rounded-2xl justify-center items-center`}
                  >
                    <Text className="text-white font-montserrat-bold text-base">
                      {primaryButtonText}
                    </Text>
                  </TouchableOpacity>
                )}

                {secondaryButtonText && (
                  <TouchableOpacity
                    onPress={onSecondaryAction || onClose}
                    activeOpacity={0.7}
                    className="w-full h-14 border border-border-color rounded-2xl justify-center items-center"
                  >
                    <Text className="text-dark-gray font-montserrat-bold text-base">
                      {secondaryButtonText}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
};

export default CustomModal;
