import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

interface StarRatingInputProps {
  value: number;
  onChange: (rating: number) => void;
  size?: number;
  disabled?: boolean;
}

const StarRatingInput: React.FC<StarRatingInputProps> = ({
  value,
  onChange,
  size = 32,
  disabled = false,
}) => (
  <View className="flex-row items-center">
    {[1, 2, 3, 4, 5].map((star) => {
      const filled = star <= value;
      return (
        <TouchableOpacity
          key={star}
          onPress={() => !disabled && onChange(star)}
          disabled={disabled}
          hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
          className="mr-1"
        >
          <Icon
            name={filled ? 'star' : 'star-outline'}
            size={size}
            color={filled ? '#F59E0B' : '#D1D5DB'}
          />
        </TouchableOpacity>
      );
    })}
  </View>
);

export default StarRatingInput;
