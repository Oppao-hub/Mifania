import React from 'react';
import { TouchableOpacity, View, Text, StyleProp, ViewStyle } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { mergeSurfaceCardStyle, SURFACE_CARD_CLASS } from '../utils/cardStyles';
import { getThemeColor } from '../theme';

const BRAND = getThemeColor('brand.DEFAULT');

type SelectableOptionCardProps = {
  selected: boolean;
  onPress: () => void;
  disabled?: boolean;
  left?: React.ReactNode;
  title: string;
  subtitle?: string;
  description?: string;
  trailing?: React.ReactNode;
  showCheckmark?: boolean;
  style?: StyleProp<ViewStyle>;
  className?: string;
};

const SelectableOptionCard: React.FC<SelectableOptionCardProps> = ({
  selected,
  onPress,
  disabled = false,
  left,
  title,
  subtitle,
  description,
  trailing,
  showCheckmark = true,
  style,
  className = '',
}) => (
  <TouchableOpacity
    activeOpacity={0.85}
    onPress={onPress}
    disabled={disabled}
    style={mergeSurfaceCardStyle(style)}
    className={`px-4 py-4 mb-4 flex-row items-center ${SURFACE_CARD_CLASS} ${
      selected && !disabled ? 'border-2 border-brand' : ''
    } ${disabled ? 'opacity-60' : ''} ${className}`}
  >
    {left ? <View className="mr-4">{left}</View> : null}

    <View className="flex-1">
      {subtitle ? (
        <Text className="text-xs font-montserrat text-brand mb-1">{subtitle}</Text>
      ) : null}
      <Text className="text-[17px] font-montserrat-bold text-dark-gray">{title}</Text>
      {description ? (
        <Text className="text-xs font-montserrat text-gray mt-1">{description}</Text>
      ) : null}
      {trailing ? <View className="mt-1">{trailing}</View> : null}
    </View>

    {showCheckmark && selected && !disabled ? (
      <Icon name="checkmark" size={24} color={BRAND} />
    ) : null}
  </TouchableOpacity>
);

export default SelectableOptionCard;
