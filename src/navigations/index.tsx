import React, { useEffect } from 'react';
import { DarkTheme, DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { Platform, StatusBar, useColorScheme } from 'react-native';
import AppNavigator from './AppNavigator';

const RootNavigation: React.FC = () => {
  const isDarkMode = useColorScheme() === 'dark';
  const theme = isDarkMode ? DarkTheme : DefaultTheme;

  useEffect(() => {
    if (Platform.OS === 'android'){
      StatusBar.setBackgroundColor(isDarkMode ? '#000' : '#ffff');
    }

    StatusBar.setBarStyle(isDarkMode ? 'light-content' : 'dark-content');
  }, [isDarkMode]);

  return (
    <NavigationContainer theme={theme}>
      <AppNavigator/>
    </NavigationContainer>
  );
};

export default RootNavigation;