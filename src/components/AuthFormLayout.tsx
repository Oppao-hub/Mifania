import React from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
  Text,
  ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from './Header';

type AuthFormLayoutProps = {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  contentContainerStyle?: ViewStyle;
};

const AuthFormLayout: React.FC<AuthFormLayoutProps> = ({
  title,
  subtitle,
  children,
  footer,
  contentContainerStyle,
}) => (
  <SafeAreaView className="flex-1 bg-app-bg" edges={['top']}>
    <Header title={title} hideNotificationBell />

    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1"
    >
      <ScrollView
        contentContainerStyle={[{ flexGrow: 1 }, contentContainerStyle]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        className="flex-1 px-6"
      >
        {subtitle ? (
          <View className="mt-6 mb-6">
            <Text className="text-sm font-montserrat text-gray leading-5">{subtitle}</Text>
          </View>
        ) : (
          <View className="mt-4" />
        )}

        {children}

        {footer ? <View className="mt-8">{footer}</View> : null}
      </ScrollView>
    </KeyboardAvoidingView>
  </SafeAreaView>
);

export default AuthFormLayout;
