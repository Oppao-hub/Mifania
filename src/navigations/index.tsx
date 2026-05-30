import React, { useEffect } from 'react';
import { DarkTheme, DefaultTheme, NavigationContainer, LinkingOptions } from '@react-navigation/native';
import { Platform, StatusBar } from 'react-native';
import AppNavigator from './AppNavigator';
import { navigationRef } from '../utils/navigation';
import { useAppearance } from '../context/AppearanceContext';
import { ROUTES } from '../utils';

const linking: LinkingOptions<Record<string, object | undefined>> = {
  prefixes: ['mifania://'],
  config: {
    screens: {
      Auth: {
        screens: {
          [ROUTES.RESET_PASSWORD]: {
            path: 'reset-password',
            parse: {
              token: (token: string) => token,
            },
          },
        },
      },
    },
  },
};

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
    <NavigationContainer theme={theme} ref={navigationRef} linking={linking}>
      <AppNavigator/>
    </NavigationContainer>
  );
};

export default RootNavigation;
