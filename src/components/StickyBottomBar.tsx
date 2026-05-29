import React from 'react';
import { View, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTabBarBottomPadding } from '../utils/layout';

export type StickyBottomBarVariant = 'inline' | 'sticky' | 'floating';

interface StickyBottomBarProps {
  children: React.ReactNode;
  /** inline: bottom of screen layout; sticky: pinned above safe area; floating: above tab bar */
  variant?: StickyBottomBarVariant;
  className?: string;
  style?: ViewStyle;
  withBorder?: boolean;
}

const StickyBottomBar: React.FC<StickyBottomBarProps> = ({
  children,
  variant = 'inline',
  className = '',
  style,
  withBorder = false,
}) => {
  const insets = useSafeAreaInsets();
  const tabBarBottomPadding = useTabBarBottomPadding();

  const borderClass = withBorder ? 'border-t border-border-color' : '';
  const baseClass = `bg-app-bg ${borderClass} ${className}`.trim();

  if (variant === 'floating') {
    return (
      <View
        className={`absolute left-6 right-6 z-50 ${baseClass}`}
        style={[{ bottom: tabBarBottomPadding }, style]}
      >
        {children}
      </View>
    );
  }

  if (variant === 'sticky') {
    return (
      <View
        className={`absolute bottom-0 left-0 right-0 px-4 pt-3 ${baseClass}`}
        style={[{ paddingBottom: Math.max(insets.bottom, 16) }, style]}
      >
        {children}
      </View>
    );
  }

  return (
    <View
      className={`px-5 pt-3 ${baseClass}`}
      style={[{ paddingBottom: Math.max(insets.bottom, 16) }, style]}
    >
      {children}
    </View>
  );
};

export default StickyBottomBar;
