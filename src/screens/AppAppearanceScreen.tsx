import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import SurfaceCard from '../components/SurfaceCard';
import { ROUTES } from '../utils';
import { useAppearance } from '../context/AppearanceContext';
import { getLanguageLabel, getThemeLabel } from '../constants/appearance';

interface SettingsRowProps {
  label: string;
  value: string;
  onPress: () => void;
  isLast?: boolean;
}

const SettingsRow: React.FC<SettingsRowProps> = ({ label, value, onPress, isLast = false }) => (
  <>
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      className="flex-row items-center justify-between py-4"
    >
      <Text className="text-[15px] font-montserrat-bold text-dark-gray">{label}</Text>
      <View className="flex-row items-center">
        <Text className="text-[15px] font-montserrat text-gray mr-2">{value}</Text>
        <Icon name="chevron-forward" size={18} color="#9CA3AF" />
      </View>
    </TouchableOpacity>
    {!isLast ? <View className="h-px bg-border-color" /> : null}
  </>
);

const AppAppearanceScreen = () => {
  const navigation = useNavigation<any>();
  const { themeMode, language } = useAppearance();

  return (
    <SafeAreaView className="flex-1 bg-app-bg" edges={['top']}>
      <View className="flex-row items-center justify-between px-6 py-4">
        <TouchableOpacity onPress={() => navigation.goBack()} className="w-10">
          <Icon name="arrow-back" size={24} color="#4B5563" />
        </TouchableOpacity>
        <Text className="text-xl font-montserrat-bold text-dark-gray">App Appearance</Text>
        <View className="w-10" />
      </View>

      <ScrollView className="flex-1 px-6 pt-2" showsVerticalScrollIndicator={false}>
        <SurfaceCard className="px-5">
          <SettingsRow
            label="Theme"
            value={getThemeLabel(themeMode)}
            onPress={() =>
              navigation.navigate(ROUTES.APPEARANCE_PICKER as never, { kind: 'theme' })
            }
          />
          <SettingsRow
            label="App Language"
            value={getLanguageLabel(language)}
            onPress={() =>
              navigation.navigate(ROUTES.APPEARANCE_PICKER as never, { kind: 'language' })
            }
            isLast
          />
        </SurfaceCard>
      </ScrollView>
    </SafeAreaView>
  );
};

export default AppAppearanceScreen;
