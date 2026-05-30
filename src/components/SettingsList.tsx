import React from 'react';
import { View, Text, TouchableOpacity, Switch } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

export const SettingsDivider = () => <View className="h-px bg-border-color ml-12" />;

export const SettingsRowDivider = () => <View className="h-px bg-border-color" />;

type SettingsMenuRowProps = {
  icon: string;
  label: string;
  onPress?: () => void;
  isLogout?: boolean;
  showChevron?: boolean;
  isLast?: boolean;
};

export const SettingsMenuRow: React.FC<SettingsMenuRowProps> = ({
  icon,
  label,
  onPress,
  isLogout = false,
  showChevron = true,
  isLast = false,
}) => (
  <>
    <TouchableOpacity onPress={onPress} activeOpacity={0.7} className="flex-row items-center py-4">
      <Icon
        name={icon}
        size={22}
        color={isLogout ? '#DC3545' : '#6A7282'}
        style={{ width: 28 }}
      />
      <Text
        className={`flex-1 text-[15px] font-montserrat-bold ${
          isLogout ? 'text-danger' : 'text-dark-gray'
        }`}
      >
        {label}
      </Text>
      {showChevron && !isLogout ? (
        <Icon name="chevron-forward" size={18} color="#9CA3AF" />
      ) : null}
    </TouchableOpacity>
    {!isLast ? <SettingsDivider /> : null}
  </>
);

type SettingsLinkRowProps = {
  label: string;
  subtitle?: string;
  onPress?: () => void;
  destructive?: boolean;
  isLast?: boolean;
};

export const SettingsLinkRow: React.FC<SettingsLinkRowProps> = ({
  label,
  subtitle,
  onPress,
  destructive = false,
  isLast = false,
}) => (
  <>
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      className="flex-row items-center py-4"
      disabled={!onPress}
    >
      <View className="flex-1 pr-3">
        <Text
          className={`text-[15px] font-montserrat-bold ${
            destructive ? 'text-danger' : 'text-dark-gray'
          }`}
        >
          {label}
        </Text>
        {subtitle ? (
          <Text className="text-xs font-montserrat text-gray mt-1 leading-4">{subtitle}</Text>
        ) : null}
      </View>
      <Icon name="chevron-forward" size={18} color="#9CA3AF" />
    </TouchableOpacity>
    {!isLast ? <SettingsRowDivider /> : null}
  </>
);

type SettingsToggleRowProps = {
  label: string;
  value: boolean;
  onToggle: () => void;
  isLast?: boolean;
};

export const SettingsToggleRow: React.FC<SettingsToggleRowProps> = ({
  label,
  value,
  onToggle,
  isLast = false,
}) => (
  <>
    <View className="flex-row items-center justify-between py-4">
      <Text className="text-[15px] font-montserrat-bold text-dark-gray">{label}</Text>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: '#E5E7EB', true: '#4A3428' }}
        thumbColor="#FFFFFF"
        ios_backgroundColor="#E5E7EB"
      />
    </View>
    {!isLast ? <SettingsRowDivider /> : null}
  </>
);

type SettingsValueRowProps = {
  label: string;
  value: string;
  onPress: () => void;
  isLast?: boolean;
};

export const SettingsValueRow: React.FC<SettingsValueRowProps> = ({
  label,
  value,
  onPress,
  isLast = false,
}) => (
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
    {!isLast ? <SettingsRowDivider /> : null}
  </>
);

type SettingsListProps = {
  children: React.ReactNode;
  className?: string;
};

/** White card wrapper for settings rows. */
export const SettingsList: React.FC<SettingsListProps> = ({ children, className = '' }) => (
  <View className={`bg-white rounded-2xl px-5 border border-border-color ${className}`}>
    {children}
  </View>
);
