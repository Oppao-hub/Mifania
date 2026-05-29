import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import Button from './Button';
import {
  getErrorPresentation,
  type ErrorPresentationOptions,
} from '../utils/errorPresentation';

export interface ErrorStateProps extends ErrorPresentationOptions {
  error?: unknown;
  onRetry?: () => void;
  retryLabel?: string;
  compact?: boolean;
  className?: string;
}

const ErrorState: React.FC<ErrorStateProps> = ({
  error,
  context,
  title,
  description,
  onRetry,
  retryLabel = 'Try Again',
  compact = false,
  className = '',
}) => {
  const presentation = useMemo(
    () => getErrorPresentation(error, { context, title, description }),
    [error, context, title, description],
  );

  const iconSize = compact ? 48 : 64;
  const circleSize = compact ? 96 : 128;

  return (
    <View className={`flex-1 items-center justify-center px-8 ${className}`}>
      <View
        className="rounded-full items-center justify-center mb-6 border border-border-color"
        style={{
          width: circleSize,
          height: circleSize,
          backgroundColor: presentation.iconBackgroundColor,
        }}
      >
        <Icon
          name={presentation.iconName}
          size={iconSize}
          color={presentation.iconColor}
        />
      </View>

      <Text style={styles.title} className="text-xl text-dark-gray text-center mb-2 px-2">
        {presentation.title}
      </Text>

      <Text style={styles.description} className="text-gray text-sm text-center leading-5 mb-8">
        {presentation.description}
      </Text>

      {onRetry ? (
        <Button
          label={retryLabel}
          onPress={onRetry}
          size={compact ? 'sm' : 'md'}
          shape="pill"
          className="px-10 shadow-sm"
        />
      ) : null}
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
  },
});

export default ErrorState;
