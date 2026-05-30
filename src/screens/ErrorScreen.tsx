import React from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute } from '@react-navigation/native';

import Header from '../components/Header';
import ErrorState, { type ErrorStateProps } from '../components/ErrorState';

export type ErrorScreenParams = ErrorStateProps & {
  headerTitle?: string;
  showBack?: boolean;
};

const ErrorScreen: React.FC = () => {
  const route = useRoute<any>();
  const {
    headerTitle = 'Error',
    showBack = true,
    onRetry,
    ...errorStateProps
  } = (route.params ?? {}) as ErrorScreenParams;

  return (
    <SafeAreaView className="flex-1 bg-app-bg" edges={['top']}>
      <Header title={headerTitle} leftVariant={showBack ? 'back' : 'empty'} hideNotificationBell />
      <View className="flex-1">
        <ErrorState onRetry={onRetry} {...errorStateProps} />
      </View>
    </SafeAreaView>
  );
};

export default ErrorScreen;
