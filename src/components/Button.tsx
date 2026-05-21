import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, ViewStyle } from 'react-native';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  isLoading?: boolean;
  disabled?: boolean;
  className?: string;     // For layout overrides (margin, width)
  textClassName?: string; // For text overrides
  style?: ViewStyle;      // For cases where dynamic styles are needed
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
}) => {
  // Define base styles using your tailwind config colors
  const variants = {
    primary: 'bg-brand shadow-sm',
    secondary: 'bg-white border border-border-color',
    outline: 'bg-transparent border border-brand',
    danger: 'bg-danger',
    ghost: 'bg-transparent',
  };

  const textVariants = {
    primary: 'text-white',
    secondary: 'text-dark-gray',
    outline: 'text-brand',
    danger: 'text-white',
    ghost: 'text-brand',
  };

  const isDisabled = disabled || isLoading;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.7}
      style={style}
      // Common layout styles + variant styles + optional overrides
      className={`h-14 rounded-2xl flex-row items-center justify-center px-6 ${variants[variant]} ${isDisabled ? 'opacity-50' : ''} ${className}`}
    >
      {isLoading ? (
        <ActivityIndicator 
          color={variant === 'secondary' || variant === 'outline' || variant === 'ghost' ? '#52622E' : '#FFFFFF'} 
        />
      ) : (
        <Text 
          numberOfLines={1}
          className={`font-montserrat-bold text-sm uppercase ${textVariants[variant]} ${textClassName}`}
        >
          {label}
        </Text>
      )}
    </TouchableOpacity>
  );
};

export default Button;
