import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, ViewStyle, View } from 'react-native';
import { LOADING_INDICATOR_COLOR } from './LoadingState';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost' | 'soft';
export type ButtonSize = 'sm' | 'md' | 'lg';
export type ButtonShape = 'default' | 'pill' | 'square';

export interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  shape?: ButtonShape;
  isLoading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  /** Tailwind classes applied to the touchable container (layout, colors, shadows, etc.) */
  className?: string;
  /** Tailwind classes applied to the label */
  textClassName?: string;
  /** Native styles for dynamic values (position, transforms, etc.) */
  style?: ViewStyle;
  leftElement?: React.ReactNode;
  activeOpacity?: number;
  numberOfLines?: number;
}

const sizeStyles: Record<ButtonSize, { container: string; text: string }> = {
  sm: { container: 'h-12 px-4', text: 'text-sm' },
  md: { container: 'h-14 px-5', text: 'text-base' },
  lg: { container: 'h-16 px-6', text: 'text-base' },
};

const shapeStyles: Record<ButtonShape, string> = {
  default: 'rounded-2xl',
  pill: 'rounded-full',
  square: 'rounded-xl',
};

const variantStyles: Record<ButtonVariant, { container: string; text: string }> = {
  primary: { container: 'bg-brand shadow-lg', text: 'text-white font-montserrat-bold tracking-wide' },
  secondary: {
    container: 'bg-white border border-border-color shadow-sm',
    text: 'text-brand-dark font-montserrat-bold',
  },
  outline: { container: 'bg-transparent border border-brand', text: 'text-brand font-montserrat-bold tracking-wide' },
  danger: { container: 'bg-red-500 shadow-sm', text: 'text-white font-montserrat-bold tracking-wide' },
  ghost: { container: 'bg-transparent', text: 'text-brand font-montserrat-bold' },
  soft: { container: 'bg-brand/10', text: 'text-brand font-montserrat-bold' },
};

const Button: React.FC<ButtonProps> = ({
  label,
  onPress,
  variant = 'primary',
  size = 'lg',
  shape = 'default',
  isLoading = false,
  disabled = false,
  fullWidth = true,
  className = '',
  textClassName = '',
  style,
  leftElement,
  activeOpacity = 0.8,
  numberOfLines = 1,
}) => {
  const isDisabled = disabled || isLoading;
  const variantStyle = variantStyles[variant];
  const sizeStyle = sizeStyles[size];

  const spinnerColor =
    variant === 'primary' || variant === 'danger'
      ? '#FFFFFF'
      : variant === 'secondary'
        ? '#4A3428'
        : LOADING_INDICATOR_COLOR;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={activeOpacity}
      style={style}
      className={[
        'flex-row items-center justify-center min-w-0',
        fullWidth ? 'w-full' : '',
        sizeStyle.container,
        shapeStyles[shape],
        variantStyle.container,
        isDisabled ? 'opacity-60' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {isLoading ? (
        <ActivityIndicator color={spinnerColor} />
      ) : (
        <>
          {leftElement ? <View className="mr-2 shrink-0">{leftElement}</View> : null}
          <View className="flex-1 min-w-0 items-center justify-center px-0.5">
            <Text
              numberOfLines={numberOfLines}
              adjustsFontSizeToFit={numberOfLines === 1}
              minimumFontScale={0.75}
              ellipsizeMode="tail"
              className={[
                variantStyle.text,
                sizeStyle.text,
                'text-center w-full',
                textClassName,
              ]
                .filter(Boolean)
                .join(' ')}
            >
              {label}
            </Text>
          </View>
        </>
      )}
    </TouchableOpacity>
  );
};

export default Button;
