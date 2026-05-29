import React from 'react';
import { Text } from 'react-native';

interface FormFieldErrorProps {
  message?: string | null;
  className?: string;
}

const FormFieldError: React.FC<FormFieldErrorProps> = ({
  message,
  className = 'ml-1 mt-1',
}) => {
  if (!message) return null;

  return (
    <Text className={`text-xs font-montserrat-medium text-danger ${className}`}>
      {message}
    </Text>
  );
};

export default FormFieldError;
