import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

interface EmptyStateProps {
  iconName: string;
  title: string;
  description: string;
  buttonText?: string;
  onButtonPress?: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  iconName,
  title,
  description,
  buttonText,
  onButtonPress,
}) => {
  return (
    <View className="flex-1 items-center justify-center px-8">
      <View className="w-32 h-32 bg-light-gray rounded-full items-center justify-center mb-6 border border-border-color">
        <Icon name={iconName} size={64} color="#52622E" />
      </View>
      
      <Text 
        style={styles.title}
        className="text-xl text-dark-gray text-center mb-2 px-2"
      >
        {title}
      </Text>
      
      <Text 
        style={styles.description}
        className="text-gray text-sm text-center mb-8 leading-5"
      >
        {description}
      </Text>
      
      {buttonText && onButtonPress && (
        <TouchableOpacity 
          onPress={onButtonPress}
          className="bg-brand px-10 py-4 rounded-full shadow-sm active:opacity-80"
        >
          <Text className="text-white font-bold text-base">
            {buttonText}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  title: {
    fontFamily: 'Montserrat-Bold',
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  description: {
    fontFamily: 'Montserrat-Regular',
    includeFontPadding: false,
    textAlignVertical: 'center',
  }
});

export default EmptyState;
