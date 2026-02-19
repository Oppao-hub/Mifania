import { DarkTheme, DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { Platform, StatusBar, useColorScheme } from 'react-native';
import { useEffect } from 'react';
import  MainNavigation  from "../navigations/MainNavigation";

export default () => {
  
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
      <MainNavigation/>
    </NavigationContainer>
  );
};