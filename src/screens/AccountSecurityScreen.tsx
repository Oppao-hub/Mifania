import React, { useState } from 'react';
import { ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { getAuth } from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

import Header from '../components/Header';
import ConfirmationBottomSheet from '../components/ConfirmationBottomSheet';
import {
  SettingsList,
  SettingsLinkRow,
  SettingsToggleRow,
} from '../components/SettingsList';
import { ROUTES, getApiErrorMessage } from '../utils';
import { RootState } from '../utils/types';
import * as Types from '../app/actions';
import { deactivateAccountApi } from '../app/api/account';
import { showBlockingError, showComingSoon, showFeedbackToast } from '../utils/userFeedback';
import type { MainNavigationProp } from '../types/navigation';

const AccountSecurityScreen = () => {
  const navigation = useNavigation<MainNavigationProp>();
  const dispatch = useDispatch();
  const token = useSelector((state: RootState) => state.authentication.data?.token);

  const [showDeactivateSheet, setShowDeactivateSheet] = useState(false);
  const [isDeactivating, setIsDeactivating] = useState(false);

  const handleDeactivateConfirm = async () => {
    if (!token) {
      showBlockingError({
        title: 'Session expired',
        message: 'Please sign in again to manage your account.',
      });
      return;
    }

    setIsDeactivating(true);

    try {
      const response = await deactivateAccountApi(token);

      try {
        const authInstance = getAuth();
        if (authInstance.currentUser) {
          await authInstance.signOut();
        }
        await GoogleSignin.signOut();
      } catch {
        // Ignore sign-out errors from providers that were not used.
      }

      dispatch({ type: Types.USER_LOGOUT });
      showFeedbackToast(response.message || 'Account deactivated.', 'success');
    } catch (error) {
      showBlockingError({
        title: 'Deactivation failed',
        message: getApiErrorMessage(error, 'Unable to deactivate your account. Please try again.'),
      });
    } finally {
      setIsDeactivating(false);
      setShowDeactivateSheet(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-app-bg" edges={['top']}>
      <Header title="Account & Security" hideNotificationBell />

      <ScrollView className="flex-1 px-6 pt-2" showsVerticalScrollIndicator={false}>
        <SettingsList className="mt-0">
          <SettingsToggleRow
            label="Biometric ID"
            value={false}
            onToggle={() => showComingSoon('Biometric ID')}
          />
          <SettingsToggleRow
            label="Face ID"
            value={false}
            onToggle={() => showComingSoon('Face ID')}
          />
          <SettingsToggleRow
            label="SMS Authenticator"
            value={false}
            onToggle={() => showComingSoon('SMS Authenticator')}
          />
          <SettingsToggleRow
            label="Google Authenticator"
            value={false}
            onToggle={() => showComingSoon('Google Authenticator')}
            isLast
          />
        </SettingsList>

        <SettingsList className="mt-4">
          <SettingsLinkRow
            label="Change Password"
            onPress={() => navigation.navigate(ROUTES.CHANGE_PASSWORD)}
          />
          <SettingsLinkRow
            label="Device Management"
            subtitle="Manage your account on the various devices you own."
            onPress={() => showComingSoon('Device Management')}
          />
          <SettingsLinkRow
            label="Deactivate Account"
            subtitle="Temporarily deactivate your account. Easily reactivate when you're ready."
            onPress={() => setShowDeactivateSheet(true)}
          />
          <SettingsLinkRow
            label="Delete Account"
            subtitle="Permanently remove your account and data. Proceed with caution."
            destructive
            onPress={() => showComingSoon('Delete Account')}
            isLast
          />
        </SettingsList>
      </ScrollView>

      <ConfirmationBottomSheet
        visible={showDeactivateSheet}
        title="Deactivate account?"
        titleTone="danger"
        message="You will be signed out and unable to use Mifania until your account is reactivated."
        description="Contact support if you need to restore access to your account."
        confirmLabel="Deactivate"
        cancelLabel="Cancel"
        confirmVariant="danger"
        onConfirm={handleDeactivateConfirm}
        onCancel={() => setShowDeactivateSheet(false)}
        isLoading={isDeactivating}
      />
    </SafeAreaView>
  );
};

export default AccountSecurityScreen;
