import React, { useEffect, useState } from 'react';

import AuthFormLayout from '../../components/AuthFormLayout';
import PasswordVisibilityToggle from '../../components/PasswordVisibilityToggle';
import { useNavigation, useRoute } from '@react-navigation/native';

import FormInput from '../../components/FormInput';
import FormFieldError from '../../components/FormFieldError';
import Button from '../../components/Button';
import { ROUTES, getApiErrorMessage, validatePasswordMatch, validatePasswordStrength } from '../../utils';
import { resetPasswordApi } from '../../app/api/passwordReset';
import { showBlockingError, showFeedbackToast } from '../../utils/userFeedback';
import type { AuthNavigationProp, AuthRouteProp } from '../../types/navigation';

const ResetPasswordScreen = () => {
  const navigation = useNavigation<AuthNavigationProp>();
  const route = useRoute<AuthRouteProp<typeof ROUTES.RESET_PASSWORD>>();
  const initialToken = route.params?.token ?? '';

  const [token, setToken] = useState(initialToken);

  useEffect(() => {
    const routeToken = route.params?.token?.trim();
    if (routeToken) {
      setToken(routeToken);
    }
  }, [route.params?.token]);

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = (): string | null => {
    if (!token.trim()) {
      return 'Reset token is missing. Open the link from your email or request a new reset.';
    }

    if (!password.trim() || !confirmPassword.trim()) {
      return 'Please fill in all password fields.';
    }

    return (
      validatePasswordMatch(password, confirmPassword) ??
      validatePasswordStrength(password)
    );
  };

  const handleSubmit = async () => {
    const validationError = validateForm();
    if (validationError) {
      setFormError(validationError);
      return;
    }

    setFormError(null);
    setIsSubmitting(true);

    try {
      const response = await resetPasswordApi({
        token: token.trim(),
        password,
        confirmPassword,
      });

      showFeedbackToast(
        response.message || 'Your password has been reset. You can sign in now.',
        'success',
      );
      navigation.navigate(ROUTES.LOGIN);
    } catch (error) {
      showBlockingError({
        title: 'Reset password failed',
        message: getApiErrorMessage(error, 'Unable to reset password. Please try again.'),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthFormLayout
      title="Reset Password"
      subtitle="Choose a strong new password for your account."
      footer={
        <Button
          label="Reset Password"
          onPress={handleSubmit}
          isLoading={isSubmitting}
          disabled={isSubmitting}
          variant="primary"
        />
      }
    >
      <FormFieldError message={formError} variant="banner" />

      {!initialToken ? (
        <FormInput
          value={token}
          onChangeText={setToken}
          placeholder="Reset token from email"
          iconName="key-outline"
          autoCapitalize="none"
          editable={!isSubmitting}
        />
      ) : null}

      <FormInput
        value={password}
        onChangeText={setPassword}
        placeholder="New password"
        iconName="lock-closed-outline"
        secureTextEntry={!showPassword}
        rightElement={
          <PasswordVisibilityToggle
            visible={showPassword}
            onToggle={() => setShowPassword((v) => !v)}
          />
        }
        editable={!isSubmitting}
      />

      <FormInput
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        placeholder="Confirm new password"
        iconName="lock-closed-outline"
        secureTextEntry={!showConfirmPassword}
        rightElement={
          <PasswordVisibilityToggle
            visible={showConfirmPassword}
            onToggle={() => setShowConfirmPassword((v) => !v)}
          />
        }
        editable={!isSubmitting}
      />
    </AuthFormLayout>
  );
};

export default ResetPasswordScreen;
