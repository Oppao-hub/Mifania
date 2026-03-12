import React, { useState } from 'react';
import { View, Button } from 'react-native';
import ConfirmationModal from '../components/ConfirmationModal';

const SettingsScreen = () => {
  const [modalConfig, setModalConfig] = useState({
    visible: false,
    title: '',
    message: '',
    onConfirm: () => {},
    isDanger: false,
  });

  const closeConfirm = () => setModalConfig({ ...modalConfig, visible: false });

  // Example: Triggering a Logout Confirmation
  const handleLogoutPress = () => {
    setModalConfig({
      visible: true,
      title: "Sign Out?",
      message: "You will need to enter your email and password again next time.",
      onConfirm: () => {
         console.log("User Logged Out"); // Replace with your Redux dispatch
         closeConfirm();
      },
      isDanger: false
    });
  };

  // Example: Triggering a Delete Confirmation
  const handleDeleteAccountPress = () => {
    setModalConfig({
      visible: true,
      title: "Delete Account",
      message: "This action is permanent. All your fashion data will be lost.",
      onConfirm: () => {
         console.log("Account Deleted");
         closeConfirm();
      },
      isDanger: true // This will turn the button red
    });
  };

  return (
    <View className="flex-1 justify-center p-4">
      <Button title="Logout" onPress={handleLogoutPress} color="#4A3428" />
      <View className="h-4" />
      <Button title="Delete Account" onPress={handleDeleteAccountPress} color="red" />

      <ConfirmationModal 
        visible={modalConfig.visible}
        title={modalConfig.title}
        message={modalConfig.message}
        onConfirm={modalConfig.onConfirm}
        onCancel={closeConfirm}
        isDanger={modalConfig.isDanger}
      />
    </View>
  );
};