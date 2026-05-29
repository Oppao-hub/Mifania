import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Button from './Button';

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
        <Button
          label={buttonText}
          onPress={onButtonPress}
          size="md"
          shape="pill"
          className="px-10 shadow-sm"
        />
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
