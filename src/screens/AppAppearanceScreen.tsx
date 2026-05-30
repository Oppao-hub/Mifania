import React from 'react';
import { ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

import Header from '../components/Header';
import SurfaceCard from '../components/SurfaceCard';
import { SettingsValueRow } from '../components/SettingsList';
import { ROUTES } from '../utils';
import { useAppearance } from '../context/AppearanceContext';
import { getLanguageLabel, getThemeLabel } from '../constants/appearance';
import type { MainNavigationProp } from '../types/navigation';

const AppAppearanceScreen = () => {
  const navigation = useNavigation<MainNavigationProp>();
  const { themeMode, language } = useAppearance();

  return (
    <SafeAreaView className="flex-1 bg-app-bg" edges={['top']}>
      <Header title="App Appearance" hideNotificationBell />

      <ScrollView className="flex-1 px-6 pt-2" showsVerticalScrollIndicator={false}>
        <SurfaceCard className="px-5">
          <SettingsValueRow
            label="Theme"
            value={getThemeLabel(themeMode)}
            onPress={() => navigation.navigate(ROUTES.APPEARANCE_PICKER, { kind: 'theme' })}
          />
          <SettingsValueRow
            label="App Language"
            value={getLanguageLabel(language)}
            onPress={() => navigation.navigate(ROUTES.APPEARANCE_PICKER, { kind: 'language' })}
            isLast
          />
        </SurfaceCard>
      </ScrollView>
    </SafeAreaView>
  );
};

export default AppAppearanceScreen;
