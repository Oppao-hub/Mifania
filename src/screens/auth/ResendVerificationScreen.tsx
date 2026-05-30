import React, { useState } from 'react';
import { View, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import AuthFormLayout from '../../components/AuthFormLayout';
import FormInput from '../../components/FormInput';
import FormFieldError from '../../components/FormFieldError';
import Button from '../../components/Button';
import { ROUTES, getApiErrorMessage, isValidEmail } from '../../utils';
import { resendVerificationEmailApi } from '../../app/api/emailVerification';
import { showBlockingError } from '../../utils/userFeedback';
import type { AuthNavigationProp } from '../../types/navigation';

const ResendVerificationScreen = () => {
  const navigation = useNavigation<AuthNavigationProp>();
  const [email, setEmail] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmationMessage, setConfirmationMessage] = useState<string | null>(null);

  const handleSubmit = async () => {
    setFormError(null);
    setConfirmationMessage(null);

    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail) {
      setFormError('Please enter your email address.');
      return;
    }

    if (!isValidEmail(trimmedEmail)) {
      setFormError('Please enter a valid email address.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await resendVerificationEmailApi(trimmedEmail);
      setConfirmationMessage(
        response.message ||
          'If an account matching your email exists and is not yet verified, we sent a new verification link.',
      );
    } catch (error) {
      showBlockingError({
        title: 'Request failed',
        message: getApiErrorMessage(error, 'Unable to send verification email. Please try again.'),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthFormLayout
      title="Resend Verification"
      subtitle="Enter the email you used to register. We will send a new verification link if your account is still pending verification."
      footer={
        confirmationMessage ? (
          <Button
            label="Back to Sign In"
            onPress={() => navigation.navigate(ROUTES.LOGIN)}
            variant="primary"
          />
        ) : (
          <Button
            label="Send Verification Link"
            onPress={handleSubmit}
            isLoading={isSubmitting}
            disabled={isSubmitting}
            variant="primary"
          />
        )
      }
    >
      {confirmationMessage ? (
        <View className="rounded-2xl border border-brand/30 bg-brand/5 px-4 py-4 mb-2">
          <Text className="text-sm font-montserrat text-brand-dark text-center leading-5">
            {confirmationMessage}
          </Text>
        </View>
      ) : null}

      <FormFieldError message={formError} variant="banner" />

      <FormInput
        value={email}
        onChangeText={(text) => {
          setEmail(text);
          setFormError(null);
        }}
        placeholder="Email Address"
        iconName="mail-outline"
        keyboardType="email-address"
        autoCapitalize="none"
        editable={!isSubmitting && !confirmationMessage}
      />
    </AuthFormLayout>
  );
};

export default ResendVerificationScreen;
