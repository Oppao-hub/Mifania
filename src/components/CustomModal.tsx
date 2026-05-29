import React from 'react';
import { Modal, View, Text, Pressable } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import Button from './Button';
import LoadingState from './LoadingState';

interface CustomModalProps {
  visible: boolean;
  onClose?: () => void;
  title?: string;
  message?: string;
  iconName?: string;
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
  iconName,
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
  const getPrimaryVariant = (): 'primary' | 'danger' => {
    if (type === 'danger') return 'danger';
    return 'primary';
  };

  const primaryClassName = type === 'success' ? 'bg-success' : '';

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View 
        className="flex-1 justify-center items-center bg-black/60 px-6"
      >
        {/* Modal Card - Pressable to stop propagation */}
        <Pressable 
          className="w-full bg-white rounded-[35px] p-8 shadow-2xl items-center"
          onPress={(e) => e.stopPropagation()}
        >
          
          {isLoading ? (
            <LoadingState
              fill={false}
              card={false}
              message={message || 'Please wait...'}
              className="py-4"
            />
          ) : (
            <>
              {/* Optional Icon */}
              {iconName && (
                <View className="mb-5 p-5 rounded-full bg-light-gray">
                  <Icon name={iconName} size={35} color={iconColor || (type === 'danger' ? '#DC3545' : '#52622E')} />
                </View>
              )}

              {/* Title */}
              {title ? (
                <Text
                  className="w-full text-xl font-montserrat-bold text-brand-dark mb-2 text-center"
                  style={{ flexShrink: 1 }}
                >
                  {title}
                </Text>
              ) : null}

              {/* Message */}
              {message ? (
                <Text className="w-full text-gray text-base font-montserrat mb-6 text-center leading-6">
                  {message}
                </Text>
              ) : null}

              {/* Dynamic Content (Inputs, Forms, etc.) */}
              {children && (
                <View className="w-full mb-6">
                  {children}
                </View>
              )}

              {/* Action Buttons */}
              <View className="w-full gap-y-3">
                {primaryButtonText && (
                  <Button
                    label={primaryButtonText}
                    onPress={onPrimaryAction ?? (() => {})}
                    variant={getPrimaryVariant()}
                    size="md"
                    className={primaryClassName}
                  />
                )}

                {secondaryButtonText && (
                  <Button
                    label={secondaryButtonText}
                    onPress={onSecondaryAction || onClose || (() => {})}
                    variant="secondary"
                    size="md"
                  />
                )}
              </View>
            </>
          )}
        </Pressable>
      </View>
    </Modal>
  );
};

export default CustomModal;
