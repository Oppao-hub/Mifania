import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

interface ProductReviewsSectionProps {
  onViewAll?: () => void;
}

const ProductReviewsSection: React.FC<ProductReviewsSectionProps> = ({ onViewAll }) => (
  <View className="mt-8 px-4">
    <View className="flex-row justify-between items-center mb-4">
      <Text className="text-base font-montserrat-bold text-dark-gray">Rating & Reviews</Text>
      {onViewAll ? (
        <TouchableOpacity onPress={onViewAll}>
          <Text className="text-sm font-montserrat-bold text-brand">View All →</Text>
        </TouchableOpacity>
      ) : null}
    </View>

    <View className="bg-light-gray rounded-2xl p-5 items-center">
      <Icon name="chatbubbles-outline" size={40} color="#9CA3AF" />
      <Text className="text-base font-montserrat-bold text-dark-gray mt-3">No reviews yet</Text>
      <Text className="text-sm font-montserrat text-gray text-center mt-2 leading-5">
        Be the first to share your experience with this sustainable piece.
      </Text>
    </View>
  </View>
);

export default ProductReviewsSection;
