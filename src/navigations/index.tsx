import React, { useEffect } from 'react';
import { DarkTheme, DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { Platform, StatusBar } from 'react-native';
import AppNavigator from './AppNavigator';
import { navigationRef } from '../utils/navigation';
import { useAppearance } from '../context/AppearanceContext';

const RootNavigation: React.FC = () => {
  const { isDarkMode } = useAppearance();
  const theme = isDarkMode ? DarkTheme : DefaultTheme;

  useEffect(() => {
    if (Platform.OS === 'android') {
      StatusBar.setTranslucent(true);
      StatusBar.setBackgroundColor('transparent');
    }
    StatusBar.setBarStyle(isDarkMode ? 'light-content' : 'dark-content');
  }, [isDarkMode]);

  return (
    <NavigationContainer theme={theme} ref={navigationRef}>
      <AppNavigator/>
    </NavigationContainer>
  );
};

export default RootNavigation;
