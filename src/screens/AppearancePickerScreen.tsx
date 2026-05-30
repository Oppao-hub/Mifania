import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import Header from '../components/Header';
import SurfaceCard from '../components/SurfaceCard';
import { useAppearance } from '../context/AppearanceContext';
import {
  AppLanguage,
  LANGUAGE_OPTIONS,
  THEME_OPTIONS,
  ThemeMode,
} from '../constants/appearance';

type PickerKind = 'theme' | 'language';

const AppearancePickerScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const kind: PickerKind = route.params?.kind === 'language' ? 'language' : 'theme';
  const { themeMode, language, setThemeMode, setLanguage } = useAppearance();

  const title = kind === 'theme' ? 'Theme' : 'App Language';
  const options = kind === 'theme' ? THEME_OPTIONS : LANGUAGE_OPTIONS;
  const selectedId = kind === 'theme' ? themeMode : language;

  const handleSelect = async (id: string) => {
    if (kind === 'theme') {
      await setThemeMode(id as ThemeMode);
    } else {
      await setLanguage(id as AppLanguage);
    }
    navigation.goBack();
  };

  return (
    <SafeAreaView className="flex-1 bg-app-bg" edges={['top']}>
      <Header title={title} hideNotificationBell />

      <ScrollView className="flex-1 px-6 pt-2" showsVerticalScrollIndicator={false}>
        <SurfaceCard className="px-5">
          {options.map((option, index) => {
            const selected = option.id === selectedId;
            return (
              <React.Fragment key={option.id}>
                <TouchableOpacity
                  onPress={() => handleSelect(option.id)}
                  activeOpacity={0.7}
                  className="flex-row items-center justify-between py-4"
                >
                  <Text
                    className={`text-[15px] font-montserrat-bold ${
                      selected ? 'text-brand' : 'text-dark-gray'
                    }`}
                  >
                    {option.label}
                  </Text>
                  {selected ? <Icon name="checkmark" size={22} color="#52622E" /> : null}
                </TouchableOpacity>
                {index < options.length - 1 ? <View className="h-px bg-border-color" /> : null}
              </React.Fragment>
            );
          })}
        </SurfaceCard>
      </ScrollView>
    </SafeAreaView>
  );
};

export default AppearancePickerScreen;
