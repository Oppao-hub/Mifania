import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import PasswordVisibilityToggle from '../components/PasswordVisibilityToggle';
import { useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';

import Header from '../components/Header';
import FormInput from '../components/FormInput';
import Button from '../components/Button';
import { RootState } from '../utils/types';
import { changePasswordApi } from '../app/api/account';
import {
  getApiErrorMessage,
  validatePasswordMatch,
  validatePasswordStrength,
} from '../utils';
import { showBlockingError, showFeedbackToast } from '../utils/userFeedback';

const ChangePasswordScreen = () => {
  const navigation = useNavigation();
  const token = useSelector((state: RootState) => state.authentication.data?.token);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = (): string | null => {
    if (!currentPassword.trim() || !newPassword.trim() || !confirmPassword.trim()) {
      return 'Please fill in all password fields.';
    }

    return (
      validatePasswordMatch(newPassword, confirmPassword, 'New password and confirmation must match.') ??
      validatePasswordStrength(newPassword) ??
      (currentPassword === newPassword
        ? 'Your new password must be different from your current password.'
        : null)
    );
  };

  const handleSubmit = async () => {
    const validationError = validateForm();
    if (validationError) {
      setFormError(validationError);
      return;
    }

    if (!token) {
      showBlockingError({
        title: 'Session expired',
        message: 'Please sign in again to change your password.',
      });
      return;
    }

    setFormError(null);
    setIsSubmitting(true);

    try {
      const response = await changePasswordApi(
        {
          currentPassword,
          newPassword,
          confirmPassword,
        },
        token,
      );

      showFeedbackToast(response.message || 'Password updated successfully.', 'success');
      navigation.goBack();
    } catch (error) {
      showBlockingError({
        title: 'Change password failed',
        message: getApiErrorMessage(error, 'Unable to change password. Please try again.'),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-app-bg" edges={['top']}>
      <Header title="Change Password" hideNotificationBell />

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          className="flex-1 px-6 pt-2"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text className="text-sm font-montserrat text-gray mb-6 leading-5">
            Enter your current password, then choose a strong new password.
          </Text>

          <FormInput
            label="Current password"
            value={currentPassword}
            onChangeText={setCurrentPassword}
            placeholder="Current password"
            iconName="lock-closed-outline"
            secureTextEntry={!showCurrent}
            rightElement={
              <PasswordVisibilityToggle
                visible={showCurrent}
                onToggle={() => setShowCurrent((v) => !v)}
              />
            }
          />

          <FormInput
            label="New password"
            value={newPassword}
            onChangeText={setNewPassword}
            placeholder="New password"
            iconName="key-outline"
            secureTextEntry={!showNew}
            rightElement={
              <PasswordVisibilityToggle visible={showNew} onToggle={() => setShowNew((v) => !v)} />
            }
          />

          <FormInput
            label="Confirm new password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Confirm new password"
            iconName="key-outline"
            secureTextEntry={!showConfirm}
            rightElement={
              <PasswordVisibilityToggle
                visible={showConfirm}
                onToggle={() => setShowConfirm((v) => !v)}
              />
            }
            error={formError}
          />

          <Button
            label="Update Password"
            onPress={handleSubmit}
            isLoading={isSubmitting}
            disabled={isSubmitting}
            fullWidth
            className="mt-2"
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ChangePasswordScreen;
