import React from 'react';
import ConfirmationBottomSheet from './ConfirmationBottomSheet';

interface LogoutBottomSheetProps {
  visible: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const LogoutBottomSheet: React.FC<LogoutBottomSheetProps> = ({
  visible,
  onConfirm,
  onCancel,
  isLoading = false,
}) => (
  <ConfirmationBottomSheet
    visible={visible}
    title="Logout"
    titleTone="danger"
    message="Are you sure you want to log out?"
    confirmLabel="Yes, Logout"
    cancelLabel="Cancel"
    onConfirm={onConfirm}
    onCancel={onCancel}
    isLoading={isLoading}
  />
);

export default LogoutBottomSheet;
