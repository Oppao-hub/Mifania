import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, ViewStyle, View } from 'react-native';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  isLoading?: boolean;
  disabled?: boolean;
  className?: string;     // For layout overrides (margin, width)
  textClassName?: string; // For text overrides
  style?: ViewStyle;      // For cases where dynamic styles are needed
  leftElement?: React.ReactNode; // Added to support Google/Apple icons
}

const Button: React.FC<ButtonProps> = ({
  label,
  onPress,
  variant = 'primary',
  isLoading = false,
  disabled = false,
  className = '',
  textClassName = '',
  style,
  leftElement,
}) => {
  // Updated to match your Login/Register screen exact styling
  const variants = {
    primary: 'bg-brand shadow-lg',
    secondary: 'bg-white border border-border-color shadow-sm', // Perfect for Google/Apple
    outline: 'bg-transparent border border-brand',
    danger: 'bg-red-500 shadow-sm',
    ghost: 'bg-transparent',
  };

  const textVariants = {
    primary: 'text-white text-base font-bold tracking-widest uppercase',
    secondary: 'text-brand-dark text-sm font-bold', // Social buttons usually aren't uppercase
    outline: 'text-brand text-base font-bold tracking-widest uppercase',
    danger: 'text-white text-base font-bold tracking-widest uppercase',
    ghost: 'text-brand text-base font-bold',
  };

  // If loading or disabled, lower opacity or apply your specific disabled logic
  const isDisabled = disabled || isLoading;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.7}
      style={style}
      // Changed to h-16 to match your modern inputs
      className={`w-full h-16 rounded-2xl flex-row items-center justify-center px-6 ${variants[variant]} ${isDisabled ? 'opacity-60' : ''} ${className}`}
    >
      {isLoading ? (
        <ActivityIndicator 
          color={variant === 'primary' || variant === 'danger' ? '#FFFFFF' : '#52622E'} 
        />
      ) : (
        <>
          {leftElement && <View className="mr-3">{leftElement}</View>}
          <Text 
            numberOfLines={1}
            className={`${textVariants[variant]} ${textClassName}`}
          >
            {label}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};

export default Button;